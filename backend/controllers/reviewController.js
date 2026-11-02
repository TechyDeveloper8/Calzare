import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { logAudit } from '../utils/auditLogger.js';

const updateProductRatingStats = async (productId) => {
  if (!productId) return;
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
      .populate('product', 'name slug sku defaultImages')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

export const adminCreateReview = async (req, res, next) => {
  try {
    const {
      productId,
      customerName,
      customerEmail,
      rating,
      title,
      comment,
      images,
      verifiedPurchase = true,
      status = 'approved',
      isFeatured = false,
      createdAt,
    } = req.body;

    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product, customer name, star rating, and review comment are required.',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Selected product was not found.' });
    }

    const reviewDoc = new Review({
      product: productId,
      customerName: customerName.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : '',
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      title: title ? title.trim() : '',
      comment: comment.trim(),
      images: Array.isArray(images) ? images.filter(Boolean) : images ? [images] : [],
      verifiedPurchase: Boolean(verifiedPurchase),
      status: status || 'approved',
      isFeatured: Boolean(isFeatured),
    });

    if (createdAt) {
      reviewDoc.createdAt = new Date(createdAt);
    }

    await reviewDoc.save();
    await reviewDoc.populate('product', 'name slug sku defaultImages');

    // Recalculate average rating & total reviews for the product
    await updateProductRatingStats(productId);

    await logAudit(req, 'ADMIN_CREATE_REVIEW', 'Review', reviewDoc._id, {
      product: productId,
      customerName,
      rating,
      status,
      isFeatured,
    });

    res.status(201).json({
      success: true,
      review: reviewDoc,
      message: 'Customer review created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateReviewStatus = async (req, res, next) => {
  try {
    const {
      status,
      isFeatured,
      customerName,
      customerEmail,
      rating,
      title,
      comment,
      verifiedPurchase,
      images,
      productId,
      createdAt,
    } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const oldProductId = review.product;

    if (productId && String(productId) !== String(oldProductId)) {
      review.product = productId;
    }
    if (status !== undefined) review.status = status;
    if (isFeatured !== undefined) review.isFeatured = Boolean(isFeatured);
    if (customerName !== undefined) review.customerName = customerName.trim();
    if (customerEmail !== undefined) review.customerEmail = customerEmail.trim();
    if (rating !== undefined) review.rating = Math.max(1, Math.min(5, Number(rating) || 5));
    if (title !== undefined) review.title = title.trim();
    if (comment !== undefined) review.comment = comment.trim();
    if (verifiedPurchase !== undefined) review.verifiedPurchase = Boolean(verifiedPurchase);
    if (images !== undefined) {
      review.images = Array.isArray(images) ? images.filter(Boolean) : images ? [images] : [];
    }
    if (createdAt) {
      review.createdAt = new Date(createdAt);
    }

    await review.save();
    await review.populate('product', 'name slug sku defaultImages');

    // Update rating stats for both new and old product (if changed)
    await updateProductRatingStats(review.product);
    if (productId && String(oldProductId) !== String(review.product)) {
      await updateProductRatingStats(oldProductId);
    }

    await logAudit(req, 'UPDATE_REVIEW', 'Review', review._id, { status, isFeatured });

    res.json({ success: true, review, message: 'Review updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateReview = adminUpdateReviewStatus;

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
