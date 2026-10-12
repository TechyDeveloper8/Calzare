import express from 'express';
import {
  validateCoupon,
  getPublicOffers,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/public', getPublicOffers);

router.get('/admin/all', protect, authorize('admin', 'superadmin', 'product_manager'), adminGetCoupons);
router.post('/admin', protect, authorize('admin', 'superadmin', 'product_manager'), adminCreateCoupon);
router.put('/admin/:id', protect, authorize('admin', 'superadmin', 'product_manager'), adminUpdateCoupon);
router.delete('/admin/:id', protect, authorize('admin', 'superadmin'), adminDeleteCoupon);

export default router;
