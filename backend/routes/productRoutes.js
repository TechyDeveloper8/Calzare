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

const router = express.Router();

// Public catalogue routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/check-delivery/:pincode', checkDeliveryPincode);
router.get('/:slug', optionalAuth, getProductBySlug);

// Protected Admin product and variant routes
router.post('/', protect, authorize('admin', 'superadmin', 'product_manager'), adminCreateProduct);
router.put('/:id', protect, authorize('admin', 'superadmin', 'product_manager'), adminUpdateProduct);
router.delete('/:id', protect, authorize('admin', 'superadmin'), adminDeleteProduct);

router.post('/:productId/variants', protect, authorize('admin', 'superadmin', 'product_manager'), adminCreateVariant);
router.put('/variants/:variantId', protect, authorize('admin', 'superadmin', 'product_manager'), adminUpdateVariant);
router.delete('/variants/:variantId', protect, authorize('admin', 'superadmin'), adminDeleteVariant);

export default router;
