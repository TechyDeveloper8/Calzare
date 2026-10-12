import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { User } from '../models/User.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { range = '30d' } = req.query;

    const now = new Date();
    let startDate = new Date();
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    // 1. Overall Order Metrics
    const ordersInRange = await Order.find({ createdAt: { $gte: startDate } }).sort({ createdAt: -1 });

    const totalOrdersCount = ordersInRange.length;
    let grossSales = 0;
    let netSales = 0;
    let totalDiscountGiven = 0;
    let totalShippingCollected = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    ordersInRange.forEach((ord) => {
      // Exclude cancelled from net sales
      if (ord.orderStatus !== 'cancelled') {
        netSales += ord.totalAmount || 0;
        grossSales += (ord.subtotal || 0) + (ord.shippingFee || 0);
        totalDiscountGiven += ord.discountAmount || 0;
        totalShippingCollected += ord.shippingFee || 0;
      } else {
        cancelledCount++;
      }

      if (ord.orderStatus === 'pending') pendingCount++;
      else if (ord.orderStatus === 'confirmed' || ord.orderStatus === 'processing') confirmedCount++;
      else if (ord.orderStatus === 'delivered') deliveredCount++;
    });

    const averageOrderValue = totalOrdersCount > cancelledCount ? Math.round(netSales / (totalOrdersCount - cancelledCount)) : 0;

    // 2. Sales Trend Grouped by Date (for chart)
    const salesTrends = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Low stock variants count
    const variants = await ProductVariant.find({ isActive: true });
    let lowStockVariantsCount = 0;
    variants.forEach((v) => {
      const hasLow = v.sizes.some((s) => s.stock <= 5);
      if (hasLow) lowStockVariantsCount++;
    });

    // 4. Products & Customers counts
    const totalProductsCount = await Product.countDocuments({ status: 'published' });
    const totalCustomersCount = await User.countDocuments({ role: 'customer' });

    // 5. Top 5 Bestselling Products
    const topProducts = await Product.find({ status: 'published' })
      .sort({ salesCount: -1, averageRating: -1 })
      .limit(5)
      .select('name slug salesCount baseRegularPrice baseSalePrice defaultImages productType');

    // 6. Recent 6 Orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('orderNumber customerName totalAmount paymentMethod paymentStatus orderStatus createdAt');

    res.json({
      success: true,
      range,
      metrics: {
        totalOrdersCount,
        grossSales,
        netSales, // Formulas: Gross Sales - Discounts; Excludes cancelled orders
        averageOrderValue,
        totalDiscountGiven,
        totalShippingCollected,
        pendingCount,
        confirmedCount,
        deliveredCount,
        cancelledCount,
        totalProductsCount,
        lowStockVariantsCount,
        totalCustomersCount,
      },
      salesTrends,
      topProducts,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};
