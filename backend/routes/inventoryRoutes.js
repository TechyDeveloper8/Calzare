import express from 'express';
import {
  getInventoryOverview,
  adjustStock,
  getInventoryMovements,
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin', 'superadmin', 'product_manager', 'order_manager'));

router.get('/overview', getInventoryOverview);
router.post('/adjust', adjustStock);
router.get('/movements', getInventoryMovements);

export default router;
