import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { StoreSetting } from '../models/StoreSetting.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../utils/razorpayHelper.js';
import { logAudit } from '../utils/auditLogger.js';
import { sendOrderConfirmationEmail, sendShippingUpdateEmail } from '../services/emailService.js';
import { fshipService } from '../services/fshipService.js';

export const createOrder = async (req, res, next) => {
  try {
    const {
      guestEmail,
      customerName,
      customerPhone,
      shippingAddress,
      items, // array of { productId, variantId, size, quantity }
      couponCode,
      paymentMethod = 'razorpay',
      notes,
    } = req.body;

    const userId = req.user?._id;

    if (!customerName || !customerPhone || !shippingAddress || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Please complete all customer and delivery address fields' });
    }

    const settings = (await StoreSetting.findOne()) || {
      freeShippingThreshold: 999,
      defaultShippingFee: 99,
      codEnabled: true,
      codFee: 49,
      taxRatePercentage: 18,
    };

    if (paymentMethod === 'cod' && !settings.codEnabled) {
      return res.status(400).json({ success: false, message: 'Cash on Delivery is currently disabled.' });
    }

    // 1. Recalculate and validate every item and its stock strictly on the server
    let subtotal = 0;
    const validatedSnapshots = [];

    for (const reqItem of items) {
      const product = await Product.findById(reqItem.productId);
      const variant = await ProductVariant.findById(reqItem.variantId);

      if (!product || !variant || product.status !== 'published' || !variant.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product?.name || 'Item'} is unavailable for purchase`,
        });
      }

      const sizeObj = variant.sizes.find((s) => s.size === reqItem.size);
      if (!sizeObj || sizeObj.stock < reqItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (${variant.colorName}, Size ${reqItem.size}). Available: ${sizeObj?.stock || 0}`,
        });
      }

      const unitPrice = variant.salePrice || product.baseSalePrice;
      const itemSubtotal = unitPrice * reqItem.quantity;
      subtotal += itemSubtotal;

      const primaryImage =
        variant.images?.find((img) => img.isMain)?.url ||
        variant.images?.[0]?.url ||
        product.defaultImages?.[0]?.url ||
        '';

      validatedSnapshots.push({
        product: product._id,
        variant: variant._id,
        productName: product.name,
        productSlug: product.slug,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        size: reqItem.size,
        sku: sizeObj?.sku || variant.variantSku,
        image: primaryImage,
        unitPrice,
        quantity: reqItem.quantity,
        subtotal: itemSubtotal,
      });
    }

    // 2. Validate coupon and calculate discount on server
    let discountAmount = 0;
    let couponApplied = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), isActive: true });
      if (coupon) {
        const now = new Date();
        const isValidDate = (!coupon.validFrom || coupon.validFrom <= now) && (!coupon.validUntil || coupon.validUntil >= now);
        const meetsMinSpend = !coupon.minOrderValue || subtotal >= coupon.minOrderValue;

        if (isValidDate && meetsMinSpend) {
          if (coupon.discountType === 'percentage') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
              discountAmount = coupon.maxDiscountAmount;
            }
          } else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
          }
          couponApplied = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          };
          // Increment usage counter
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          await coupon.save();
        }
      }
    }

    // 3. Shipping fee
    let shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.defaultShippingFee;
    if (paymentMethod === 'cod' && settings.codFee) {
      shippingFee += settings.codFee;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    // 4. Generate unique order number (CALZ-YYYY-XXXXX)
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `CALZ-${year}-${randomHex}`;

    // 5. Deduct inventory & record movement logs
    for (const snapshot of validatedSnapshots) {
      const variant = await ProductVariant.findById(snapshot.variant);
      if (variant) {
        const sizeEntry = variant.sizes.find((s) => s.size === snapshot.size);
        if (sizeEntry) {
          const prev = sizeEntry.stock;
          sizeEntry.stock = Math.max(0, sizeEntry.stock - snapshot.quantity);
          await variant.save();

          // Increment parent product salesCount
          await Product.findByIdAndUpdate(snapshot.product, { $inc: { salesCount: snapshot.quantity } });

          await InventoryMovement.create({
            product: snapshot.product,
            variant: snapshot.variant,
            size: snapshot.size,
            sku: snapshot.sku,
            changeQuantity: -snapshot.quantity,
            previousStock: prev,
            newStock: sizeEntry.stock,
            reason: 'order_placed',
            referenceId: orderNumber,
            note: `Order ${orderNumber} placed`,
            performedBy: userId || null,
          });
        }
      }
    }

    // 6. Handle Razorpay or COD payment order
    let razorpayOrderData = null;
    let paymentStatus = 'pending';
    let orderStatus = 'pending';

    if (paymentMethod === 'razorpay') {
      const rzpRes = await createRazorpayOrder(totalAmount, orderNumber);
      if (rzpRes.success) {
        razorpayOrderData = rzpRes.order;
      }
    } else if (paymentMethod === 'cod') {
      paymentStatus = 'pending';
      orderStatus = 'confirmed';
    }

    // 7. Save Order record in MongoDB
    const order = await Order.create({
      orderNumber,
      customer: userId || null,
      guestEmail: guestEmail || (req.user ? req.user.email : null),
      customerName,
      customerPhone,
      shippingAddress,
      items: validatedSnapshots,
      subtotal,
      discountAmount,
      couponApplied,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentStatus,
      paymentDetails: {
        razorpayOrderId: razorpayOrderData ? razorpayOrderData.id : null,
      },
      orderStatus,
      notes,
      timeline: [
        {
          status: orderStatus,
          note: `Order created via ${paymentMethod.toUpperCase()}`,
          performedBy: customerName,
        },
      ],
    });

    // 8. Clear Cart if customer had one
    if (userId) {
      await Cart.findOneAndUpdate({ user: userId }, { items: [], couponCode: null });
    }

    res.status(201).json({
      success: true,
      order,
      razorpayOrder: razorpayOrderData,
      razorpayKeyId: settings.razorpayKeyId,
      message: 'Order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify cryptographic HMAC SHA256 signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid && process.env.NODE_ENV === 'production') {
      order.paymentStatus = 'failed';
      order.timeline.push({
        status: 'payment_failed',
        note: 'Razorpay cryptographic signature verification failed',
        performedBy: 'Razorpay Gateway',
      });
      await order.save();
      return res.status(400).json({ success: false, message: 'Cryptographic payment verification failed' });
    }

    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paidAt: new Date(),
    };
    order.timeline.push({
      status: 'confirmed',
      note: `Payment verified successfully (ID: ${razorpayPaymentId})`,
      performedBy: 'Razorpay Gateway',
    });

    await order.save();

    res.json({
      success: true,
      order,
      message: 'Payment verified and order confirmed!',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [{ customer: req.user._id }, { guestEmail: req.user.email }],
    }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order;

    // Support lookup by orderId or orderNumber
    if (id.startsWith('CALZ-')) {
      order = await Order.findOne({ orderNumber: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If customer is requesting, make sure they own it (or guest access)
    if (req.user && req.user.role === 'customer') {
      const isOwner =
        (order.customer && order.customer.toString() === req.user._id.toString()) ||
        order.guestEmail === req.user.email;
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// Admin Fulfillment Endpoints
export const adminGetAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status, paymentStatus, search } = req.query;

    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { customerName: new RegExp(search, 'i') },
        { guestEmail: new RegExp(search, 'i') },
        { customerPhone: new RegExp(search, 'i') },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      orders,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, fulfillmentStatus, trackingInfo, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prevStatus = order.orderStatus;
    if (orderStatus) order.orderStatus = orderStatus;
    if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;

    const carrierName = req.body.carrier || req.body.courierName || req.body.trackingInfo?.carrier || req.body.trackingInfo?.courierName;
    const trackingNum = req.body.trackingNumber || req.body.trackingInfo?.trackingNumber;
    const trackingUrl = req.body.trackingUrl || req.body.trackingInfo?.trackingUrl;

    if (carrierName || trackingNum || trackingInfo) {
      order.trackingInfo = {
        ...order.trackingInfo,
        carrier: carrierName || order.trackingInfo?.carrier,
        courierName: carrierName || order.trackingInfo?.courierName,
        trackingNumber: trackingNum || order.trackingInfo?.trackingNumber,
        trackingUrl: trackingUrl || order.trackingInfo?.trackingUrl,
        shippedAt: orderStatus === 'shipped' ? new Date() : order.trackingInfo?.shippedAt,
      };
    }

    order.timeline.push({
      status: orderStatus || prevStatus,
      note: note || `Status updated from ${prevStatus} to ${orderStatus}`,
      performedBy: req.user.name,
      timestamp: new Date(),
    });

    await order.save();
    await logAudit(req, 'UPDATE_ORDER_STATUS', 'Order', order._id, { prevStatus, newStatus: orderStatus });

    if (orderStatus === 'shipped') {
      sendShippingUpdateEmail(order).catch(console.error);
    }

    res.json({ success: true, order, message: `Order updated to ${orderStatus}` });
  } catch (error) {
    next(error);
  }
};

export const adminShipWithFShip = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot ship a cancelled order' });
    }

    const fshipRes = await fshipService.createForwardOrder(order);
    if (!fshipRes.success) {
      return res.status(400).json({
        success: false,
        message: fshipRes.message || 'FShip forward order creation failed',
        details: fshipRes.details,
      });
    }

    order.orderStatus = 'shipped';
    order.fulfillmentStatus = 'fulfilled';
    order.trackingInfo = {
      courierName: fshipRes.courierName,
      carrier: fshipRes.courierName,
      trackingNumber: fshipRes.waybill,
      trackingUrl: fshipRes.trackingUrl,
      shippedAt: new Date(),
    };

    order.timeline.push({
      status: 'shipped',
      note: `Shipment booked with ${fshipRes.courierName} via FShip (Waybill: ${fshipRes.waybill})`,
      performedBy: req.user.name,
      timestamp: new Date(),
    });

    await order.save();
    await logAudit(req, 'FSHIP_SHIP_ORDER', 'Order', order._id, { waybill: fshipRes.waybill, courier: fshipRes.courierName });

    sendShippingUpdateEmail(order).catch(console.error);

    res.json({
      success: true,
      order,
      fship: fshipRes,
      message: `Shipment booked via FShip! AWB: ${fshipRes.waybill}`,
    });
  } catch (error) {
    next(error);
  }
};

export const adminCancelOrder = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    // Restock items into inventory
    for (const item of order.items) {
      const variant = await ProductVariant.findById(item.variant);
      if (variant) {
        const sizeEntry = variant.sizes.find((s) => s.size === item.size);
        if (sizeEntry) {
          const prev = sizeEntry.stock;
          sizeEntry.stock += item.quantity;
          await variant.save();

          await InventoryMovement.create({
            product: item.product,
            variant: item.variant,
            size: item.size,
            sku: item.sku,
            changeQuantity: item.quantity,
            previousStock: prev,
            newStock: sizeEntry.stock,
            reason: 'order_cancelled',
            referenceId: order.orderNumber,
            note: `Order ${order.orderNumber} cancelled by admin`,
            performedBy: req.user._id,
          });
        }
      }
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = cancellationReason || 'Cancelled by store staff';
    order.timeline.push({
      status: 'cancelled',
      note: `Cancelled: ${order.cancellationReason}`,
      performedBy: req.user.name,
    });

    await order.save();
    await logAudit(req, 'CANCEL_ORDER', 'Order', order._id, { reason: order.cancellationReason });

    res.json({ success: true, order, message: 'Order cancelled and inventory restocked successfully' });
  } catch (error) {
    next(error);
  }
};

export const razorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      'calzareRazorpaySecretTest98765';
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');
      if (digest !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id || payload?.order?.entity?.id;

      if (rzpOrderId) {
        const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': rzpOrderId });
        if (order && order.paymentStatus !== 'completed') {
          order.paymentStatus = 'completed';
          order.orderStatus = 'confirmed';
          order.paymentDetails.razorpayPaymentId = paymentEntity?.id;
          order.paymentDetails.paidAt = new Date();
          order.timeline.push({
            status: 'confirmed',
            note: `Payment captured via Razorpay Webhook (${paymentEntity?.id})`,
            performedBy: 'Razorpay Webhook',
          });
          await order.save();
          sendOrderConfirmationEmail(order).catch(console.error);
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      if (rzpOrderId) {
        const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': rzpOrderId });
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'failed';
          order.timeline.push({
            status: 'payment_failed',
            note: `Payment failed via Webhook: ${paymentEntity?.error_description || 'Gateway Error'}`,
            performedBy: 'Razorpay Webhook',
          });
          await order.save();
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

export const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber, emailOrPhone } = req.body;
    if (!orderNumber || !emailOrPhone) {
      return res.status(400).json({
        success: false,
        message: 'Order number and either email or phone number are required.',
      });
    }

    const cleanOrderNum = orderNumber.trim().toUpperCase();
    const cleanId = emailOrPhone.trim().toLowerCase();
    const digitsOnly = cleanId.replace(/\D/g, '');

    const order = await Order.findOne({
      orderNumber: cleanOrderNum,
      $or: [
        { guestEmail: cleanId },
        { customerPhone: cleanId },
        { customerPhone: digitsOnly ? { $regex: digitsOnly } : cleanId },
        { 'shippingAddress.phone': cleanId },
        { 'shippingAddress.phone': digitsOnly ? { $regex: digitsOnly } : cleanId },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order matching those credentials could be found. Please double-check your order number and contact detail.',
      });
    }

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        shippingAddress: {
          fullName: order.shippingAddress.fullName,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
        },
        items: order.items,
        trackingInfo: order.trackingInfo,
        timeline: order.timeline,
      },
    });
  } catch (error) {
    next(error);
  }
};

