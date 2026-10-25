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
import { cacheResponse, invalidateCache } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Auto-purge catalog and homepage caches when categories/collections change
const purgeCatalogCache = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCache('/api/v1/catalog', '/api/v1/homepage', '/api/v1/products');
    }
  });
  next();
};

// Categories (cached in-memory 120s, browser 60s, CDN s-maxage 300s)
router.get('/categories', cacheResponse(120, 60, 300), getCategories);
router.get('/categories/admin/all', protect, authorize('admin', 'superadmin', 'product_manager'), adminGetAllCategories);
router.post('/categories', protect, authorize('admin', 'superadmin', 'product_manager'), purgeCatalogCache, adminCreateCategory);
router.put('/categories/:id', protect, authorize('admin', 'superadmin', 'product_manager'), purgeCatalogCache, adminUpdateCategory);
router.delete('/categories/:id', protect, authorize('admin', 'superadmin'), purgeCatalogCache, adminDeleteCategory);

// Collections (cached in-memory 60s, browser 30s, CDN s-maxage 120s)
router.get('/collections', cacheResponse(60, 30, 120), getCollections);
router.get('/collections/:slug', cacheResponse(60, 30, 120), getCollectionBySlug);
router.get('/collections/admin/all', protect, authorize('admin', 'superadmin', 'product_manager'), adminGetAllCollections);
router.post('/collections', protect, authorize('admin', 'superadmin', 'product_manager'), purgeCatalogCache, adminCreateCollection);
router.put('/collections/:id', protect, authorize('admin', 'superadmin', 'product_manager'), purgeCatalogCache, adminUpdateCollection);
router.delete('/collections/:id', protect, authorize('admin', 'superadmin'), purgeCatalogCache, adminDeleteCollection);

export default router;
