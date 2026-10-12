import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin', 'superadmin', 'product_manager', 'order_manager'), getDashboardAnalytics);

export default router;
