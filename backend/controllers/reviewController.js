import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { logAudit } from '../utils/auditLogger.js';

const updateProductRatingStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { productId, customerName, customerEmail, rating, title, comment, images } = req.body;
    const userId = req.user?._id;

    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating, review comment, and name are required' });
    }

    // Check if customer had a verified delivered purchase of this product
    let verifiedPurchase = false;
    if (userId || customerEmail) {
      const orderMatch = await Order.findOne({
        $or: [{ customer: userId }, { guestEmail: customerEmail }],
        'items.product': productId,
        orderStatus: { $in: ['delivered', 'confirmed', 'shipped'] },
      });
      if (orderMatch) verifiedPurchase = true;
    }

    const review = await Review.create({
      product: productId,
      user: userId || null,
      customerName,
      customerEmail,
      rating: Number(rating),
      title,
      comment,
      images: images || [],
      verifiedPurchase,
      status: 'approved', // Auto-approved by default in e-commerce, but moderatable by admin
    });

    await updateProductRatingStats(productId);

    res.status(201).json({
      success: true,
      review,
      message: 'Thank you! Your verified review has been posted.',
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name slug defaultImages')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateReviewStatus = async (req, res, next) => {
  try {
    const { status, isFeatured } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (status !== undefined) review.status = status;
    if (isFeatured !== undefined) review.isFeatured = isFeatured;

    await review.save();
    await updateProductRatingStats(review.product);
    await logAudit(req, 'UPDATE_REVIEW', 'Review', review._id, { status, isFeatured });

    res.json({ success: true, review, message: 'Review updated' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const productId = review.product;
    await review.deleteOne();
    await updateProductRatingStats(productId);
    await logAudit(req, 'DELETE_REVIEW', 'Review', req.params.id);

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
