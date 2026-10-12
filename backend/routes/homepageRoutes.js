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

const router = express.Router();

// Public storefront dynamic homepage
router.get('/', getPublishedHomepage);

// Admin Visual Homepage CMS
router.get('/admin/sections', protect, authorize('admin', 'superadmin', 'editor'), adminGetAllSections);
router.get('/admin/sections/:id', protect, authorize('admin', 'superadmin', 'editor'), adminGetSectionById);
router.post('/admin/sections', protect, authorize('admin', 'superadmin', 'editor'), adminCreateSection);
router.put('/admin/sections/reorder', protect, authorize('admin', 'superadmin', 'editor'), adminReorderSections);
router.put('/admin/sections/:id', protect, authorize('admin', 'superadmin', 'editor'), adminUpdateSection);
router.patch('/admin/sections/:id/toggle', protect, authorize('admin', 'superadmin', 'editor'), adminToggleSection);
router.delete('/admin/sections/:id', protect, authorize('admin', 'superadmin'), adminDeleteSection);

export default router;
