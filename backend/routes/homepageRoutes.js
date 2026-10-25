import express from 'express';
import {
  getPublishedHomepage,
  adminGetAllSections,
  adminGetSectionById,
  adminCreateSection,
  adminUpdateSection,
  adminReorderSections,
  adminToggleSection,
  adminDeleteSection,
} from '../controllers/homepageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { cacheResponse, invalidateCache } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Auto-purge homepage cache when admin makes modifications
const purgeHomepageCache = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCache('/api/v1/homepage');
    }
  });
  next();
};

// Public storefront dynamic homepage (cached in memory 60s, browser 30s, CDN s-maxage 120s)
router.get('/', cacheResponse(60, 30, 120), getPublishedHomepage);

// Admin Visual Homepage CMS
router.get('/admin/sections', protect, authorize('admin', 'superadmin', 'editor'), adminGetAllSections);
router.get('/admin/sections/:id', protect, authorize('admin', 'superadmin', 'editor'), adminGetSectionById);
router.post('/admin/sections', protect, authorize('admin', 'superadmin', 'editor'), purgeHomepageCache, adminCreateSection);
router.put('/admin/sections/reorder', protect, authorize('admin', 'superadmin', 'editor'), purgeHomepageCache, adminReorderSections);
router.put('/admin/sections/:id', protect, authorize('admin', 'superadmin', 'editor'), purgeHomepageCache, adminUpdateSection);
router.patch('/admin/sections/:id/toggle', protect, authorize('admin', 'superadmin', 'editor'), purgeHomepageCache, adminToggleSection);
router.delete('/admin/sections/:id', protect, authorize('admin', 'superadmin'), purgeHomepageCache, adminDeleteSection);

export default router;
