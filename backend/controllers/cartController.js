import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Coupon } from '../models/Coupon.js';
import { StoreSetting } from '../models/StoreSetting.js';

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.json({
        success: true,
        cart: { items: [], subtotal: 0, discount: 0, shippingFee: 0, total: 0 },
      });
    }

    // Hydrate each item with live product & variant stock info
    const settings = (await StoreSetting.findOne()) || {
      freeShippingThreshold: 999,
      defaultShippingFee: 99,
    };

    let subtotal = 0;
    const validatedItems = [];
    const stockAlerts = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      const variant = await ProductVariant.findById(item.variant);

      if (!product || !variant || product.status !== 'published' || !variant.isActive) {
        stockAlerts.push(`An item is no longer available and was removed.`);
        continue;
      }

      // Check specific size stock
      const sizeObj = variant.sizes.find((s) => s.size === item.size);
      const availableStock = sizeObj ? sizeObj.stock : 0;

      if (availableStock <= 0) {
        stockAlerts.push(`${product.name} (${variant.colorName}, Size ${item.size}) is now out of stock.`);
        continue;
      }

      const validatedQuantity = Math.min(item.quantity, availableStock);
      if (validatedQuantity < item.quantity) {
        stockAlerts.push(
          `Quantity for ${product.name} (${variant.colorName}, Size ${item.size}) was reduced to available stock (${validatedQuantity}).`
        );
      }

      const unitPrice = variant.salePrice || product.baseSalePrice;
      const itemSubtotal = unitPrice * validatedQuantity;
      subtotal += itemSubtotal;

      const primaryImage =
        variant.images?.find((img) => img.isMain)?.url ||
        variant.images?.[0]?.url ||
        product.defaultImages?.[0]?.url ||
        '';

      validatedItems.push({
        _id: item._id,
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        variantId: variant._id,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        size: item.size,
        sku: sizeObj?.sku || variant.variantSku,
        image: primaryImage,
        unitPrice,
        regularPrice: variant.regularPrice || product.baseRegularPrice,
        quantity: validatedQuantity,
        subtotal: itemSubtotal,
        maxStock: availableStock,
      });
    }

    // Update cart with valid items
    cart.items = validatedItems.map((i) => ({
      product: i.productId,
      variant: i.variantId,
      size: i.size,
      quantity: i.quantity,
    }));
    await cart.save();

    // Calculate coupon discount
    let discount = 0;
    let couponDetails = null;
    if (cart.couponCode) {
      const coupon = await Coupon.findOne({ code: cart.couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        const isValidDate = (!coupon.validFrom || coupon.validFrom <= now) && (!coupon.validUntil || coupon.validUntil >= now);
        const meetsMinSpend = !coupon.minOrderValue || subtotal >= coupon.minOrderValue;

        if (isValidDate && meetsMinSpend) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
              discount = coupon.maxDiscountAmount;
            }
          } else {
            discount = Math.min(coupon.discountValue, subtotal);
          }
          couponDetails = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: discount,
          };
        } else {
          cart.couponCode = undefined;
          await cart.save();
        }
      }
    }

    const shippingFee = subtotal >= settings.freeShippingThreshold || subtotal === 0 ? 0 : settings.defaultShippingFee;
    const finalTotal = Math.max(0, subtotal - discount + shippingFee);

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: validatedItems,
        subtotal,
        discount,
        coupon: couponDetails,
        shippingFee,
        total: finalTotal,
        freeShippingThreshold: settings.freeShippingThreshold,
        freeShippingDelta: Math.max(0, settings.freeShippingThreshold - subtotal),
      },
      stockAlerts,
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, size, quantity = 1, sessionId } = req.body;
    const userId = req.user?._id;

    if (!productId || !variantId || !size) {
      return res.status(400).json({ success: false, message: 'Product, variant, and size are required' });
    }

    const product = await Product.findById(productId);
    const variant = await ProductVariant.findById(variantId);

    if (!product || !variant || product.status !== 'published' || !variant.isActive) {
      return res.status(404).json({ success: false, message: 'Selected product or variant is unavailable' });
    }

    const sizeObj = variant.sizes.find((s) => s.size === size);
    if (!sizeObj || sizeObj.stock <= 0) {
      return res.status(400).json({ success: false, message: `Size ${size} is currently out of stock` });
    }

    // Find or create cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
      if (!cart) cart = new Cart({ user: userId, items: [] });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
      if (!cart) cart = new Cart({ sessionId, items: [] });
    } else {
      const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      cart = new Cart({ sessionId: newSessionId, items: [] });
    }

    // Check if variant and size already in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.variant.toString() === variantId && item.size === size
    );

    const qtyToAdd = parseInt(quantity) || 1;

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qtyToAdd;
      if (newQty > sizeObj.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Maximum available stock for size ${size} is ${sizeObj.stock}.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      if (qtyToAdd > sizeObj.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${sizeObj.stock}).`,
        });
      }
      cart.items.push({
        product: productId,
        variant: variantId,
        size,
        quantity: qtyToAdd,
      });
    }

    await cart.save();
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    let cart;
    if (userId) cart = await Cart.findOne({ user: userId });
    else if (sessionId) cart = await Cart.findOne({ sessionId });

    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    const newQty = parseInt(quantity);
    if (newQty <= 0) {
      item.deleteOne();
    } else {
      // Validate available stock
      const variant = await ProductVariant.findById(item.variant);
      const sizeObj = variant?.sizes?.find((s) => s.size === item.size);
      if (sizeObj && newQty > sizeObj.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${sizeObj.stock} units available for size ${item.size}`,
        });
      }
      item.quantity = newQty;
    }

    await cart.save();
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    let cart;
    if (userId) cart = await Cart.findOne({ user: userId });
    else if (sessionId) cart = await Cart.findOne({ sessionId });

    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;

    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive promotional code' });
    }

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      return res.status(400).json({ success: false, message: 'This coupon is not active yet' });
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon usage limit has been reached' });
    }

    let cart;
    if (userId) cart = await Cart.findOne({ user: userId });
    else if (sessionId) cart = await Cart.findOne({ sessionId });

    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.couponCode = coupon.code;
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const removeCoupon = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    let cart;
    if (userId) cart = await Cart.findOne({ user: userId });
    else if (sessionId) cart = await Cart.findOne({ sessionId });

    if (cart) {
      cart.couponCode = undefined;
      await cart.save();
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};
