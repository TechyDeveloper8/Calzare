import express from 'express';
import {
  getPageBySlug,
  getJournalArticles,
  getJournalArticleBySlug,
  submitContactInquiry,
  adminGetInquiries,
  adminGetPages,
  adminCreatePage,
  adminUpdatePage,
  adminDeletePage,
} from '../controllers/cmsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public CMS and Editorial Routes
router.get('/page/:slug', getPageBySlug);
router.get('/journal', getJournalArticles);
router.get('/journal/:slug', getJournalArticleBySlug);
router.post('/contact', submitContactInquiry);

// Admin CMS Management
router.get('/admin/all', protect, authorize('admin', 'superadmin', 'editor'), adminGetPages);
router.get('/admin/inquiries', protect, authorize('admin', 'superadmin', 'editor'), adminGetInquiries);
router.post('/admin', protect, authorize('admin', 'superadmin', 'editor'), adminCreatePage);
router.put('/admin/:id', protect, authorize('admin', 'superadmin', 'editor'), adminUpdatePage);
router.delete('/admin/:id', protect, authorize('admin', 'superadmin'), adminDeletePage);

export default router;

