import express from 'express';
import {
  getProducts,
  getProductBySlug,
  checkDeliveryPincode,
  searchProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminCreateVariant,
  adminUpdateVariant,
  adminDeleteVariant,
} from '../controllers/productController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';
import { cacheResponse, invalidateCache } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Auto-purge products and dependent homepage caches when catalog is modified
const purgeProductCache = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCache('/api/v1/products', '/api/v1/homepage', '/api/v1/catalog');
    }
  });
  next();
};

// Public catalogue routes
router.get('/', cacheResponse(30, 15, 60), getProducts);
router.get('/search', cacheResponse(15, 10, 30), searchProducts);
router.get('/check-delivery/:pincode', cacheResponse(300, 120, 600), checkDeliveryPincode);
router.get('/:slug', optionalAuth, cacheResponse(30, 15, 60), getProductBySlug);

// Protected Admin product and variant routes
router.post('/', protect, authorize('admin', 'superadmin', 'product_manager'), purgeProductCache, adminCreateProduct);
router.put('/:id', protect, authorize('admin', 'superadmin', 'product_manager'), purgeProductCache, adminUpdateProduct);
router.delete('/:id', protect, authorize('admin', 'superadmin'), purgeProductCache, adminDeleteProduct);

router.post('/:productId/variants', protect, authorize('admin', 'superadmin', 'product_manager'), purgeProductCache, adminCreateVariant);
router.put('/variants/:variantId', protect, authorize('admin', 'superadmin', 'product_manager'), purgeProductCache, adminUpdateVariant);
router.delete('/variants/:variantId', protect, authorize('admin', 'superadmin'), purgeProductCache, adminDeleteVariant);

export default router;
