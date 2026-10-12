import express from 'express';
import { uploadMedia, getMediaAssets, deleteMediaAsset } from '../controllers/mediaController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/upload',
  protect,
  authorize('admin', 'superadmin', 'editor', 'product_manager'),
  upload.array('files', 10),
  uploadMedia
);

router.get('/', protect, authorize('admin', 'superadmin', 'editor', 'product_manager'), getMediaAssets);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteMediaAsset);

export default router;
