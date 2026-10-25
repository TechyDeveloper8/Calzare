import express from 'express';
import {
  getPublicStoryPage,
  adminGetStoryPage,
  adminUpdateStoryPage,
  adminAddSection,
  adminDuplicateSection,
  adminDeleteSection,
  adminReorderSections,
  adminToggleSection,
  adminPublishStoryPage,
  adminUnpublishStoryPage,
} from '../controllers/storyController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public storefront route (supports ?preview=true with staff auth)
router.get('/', optionalAuth, getPublicStoryPage);

// Admin CMS Management
router.get('/admin', protect, authorize('admin', 'superadmin', 'editor'), adminGetStoryPage);
router.put('/admin', protect, authorize('admin', 'superadmin', 'editor'), adminUpdateStoryPage);
router.post('/admin/sections', protect, authorize('admin', 'superadmin', 'editor'), adminAddSection);
router.post('/admin/sections/:sectionId/duplicate', protect, authorize('admin', 'superadmin', 'editor'), adminDuplicateSection);
router.delete('/admin/sections/:sectionId', protect, authorize('admin', 'superadmin', 'editor'), adminDeleteSection);
router.put('/admin/sections/reorder', protect, authorize('admin', 'superadmin', 'editor'), adminReorderSections);
router.patch('/admin/sections/:sectionId/toggle', protect, authorize('admin', 'superadmin', 'editor'), adminToggleSection);
router.post('/admin/publish', protect, authorize('admin', 'superadmin', 'editor'), adminPublishStoryPage);
router.post('/admin/unpublish', protect, authorize('admin', 'superadmin', 'editor'), adminUnpublishStoryPage);

export default router;
