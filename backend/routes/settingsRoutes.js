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
import { cacheResponse, invalidateCache } from '../middleware/cacheMiddleware.js';
import { formLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const purgeSettingsCache = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCache('/api/v1/settings');
    }
  });
  next();
};

// Public routes (cached in-memory 120s, browser 60s, CDN s-maxage 300s)
router.get('/public', cacheResponse(120, 60, 300), getPublicSettings);
router.post('/newsletter', formLimiter, subscribeNewsletter);

// Protected admin routes
router.get('/admin', protect, authorize('admin', 'superadmin'), adminGetSettings);
router.put('/admin', protect, authorize('admin', 'superadmin'), purgeSettingsCache, adminUpdateSettings);
router.post('/admin/test-fship', protect, authorize('admin', 'superadmin'), adminTestFshipConnection);
router.get('/subscribers', protect, authorize('admin', 'superadmin', 'editor'), adminGetSubscribers);
router.get('/audit-logs', protect, authorize('admin', 'superadmin'), adminGetAuditLogs);

export default router;
