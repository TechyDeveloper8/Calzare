import express from 'express';
import {
  createReview,
  adminGetReviews,
  adminCreateReview,
  adminUpdateReview,
  adminDeleteReview,
} from '../controllers/reviewController.js';
import { protect, optionalAuth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createReview);

router.get('/admin/all', protect, authorize('admin', 'superadmin', 'customer_support', 'editor', 'product_manager'), adminGetReviews);
router.post('/admin', protect, authorize('admin', 'superadmin', 'editor', 'product_manager'), adminCreateReview);
router.put('/admin/:id', protect, authorize('admin', 'superadmin', 'editor', 'product_manager'), adminUpdateReview);
router.delete('/admin/:id', protect, authorize('admin', 'superadmin'), adminDeleteReview);

export default router;
