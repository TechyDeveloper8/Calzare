import express from 'express';
import {
  getPublicSettings,
  adminGetSettings,
  adminUpdateSettings,
  adminTestFshipConnection,
  subscribeNewsletter,
  adminGetSubscribers,
  adminGetAuditLogs,
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicSettings);
router.post('/newsletter', subscribeNewsletter);

// Protected admin routes
router.get('/admin', protect, authorize('admin', 'superadmin'), adminGetSettings);
router.put('/admin', protect, authorize('admin', 'superadmin'), adminUpdateSettings);
router.post('/admin/test-fship', protect, authorize('admin', 'superadmin'), adminTestFshipConnection);
router.get('/subscribers', protect, authorize('admin', 'superadmin', 'editor'), adminGetSubscribers);
router.get('/audit-logs', protect, authorize('admin', 'superadmin'), adminGetAuditLogs);

export default router;
