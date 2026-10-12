import express from 'express';
import {
  createReview,
  adminGetReviews,
  adminUpdateReviewStatus,
  adminDeleteReview,
} from '../controllers/reviewController.js';
import { protect, optionalAuth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createReview);

router.get('/admin/all', protect, authorize('admin', 'superadmin', 'customer_support', 'editor'), adminGetReviews);
router.put('/admin/:id', protect, authorize('admin', 'superadmin', 'editor'), adminUpdateReviewStatus);
router.delete('/admin/:id', protect, authorize('admin', 'superadmin'), adminDeleteReview);

export default router;
