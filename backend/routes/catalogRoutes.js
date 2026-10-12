import express from 'express';
import {
  getCategories,
  adminGetAllCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  getCollections,
  getCollectionBySlug,
  adminGetAllCollections,
  adminCreateCollection,
  adminUpdateCollection,
  adminDeleteCollection,
} from '../controllers/catalogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Categories
router.get('/categories', getCategories);
router.get('/categories/admin/all', protect, authorize('admin', 'superadmin', 'product_manager'), adminGetAllCategories);
router.post('/categories', protect, authorize('admin', 'superadmin', 'product_manager'), adminCreateCategory);
router.put('/categories/:id', protect, authorize('admin', 'superadmin', 'product_manager'), adminUpdateCategory);
router.delete('/categories/:id', protect, authorize('admin', 'superadmin'), adminDeleteCategory);

// Collections
router.get('/collections', getCollections);
router.get('/collections/:slug', getCollectionBySlug);
router.get('/collections/admin/all', protect, authorize('admin', 'superadmin', 'product_manager'), adminGetAllCollections);
router.post('/collections', protect, authorize('admin', 'superadmin', 'product_manager'), adminCreateCollection);
router.put('/collections/:id', protect, authorize('admin', 'superadmin', 'product_manager'), adminUpdateCollection);
router.delete('/collections/:id', protect, authorize('admin', 'superadmin'), adminDeleteCollection);

export default router;
