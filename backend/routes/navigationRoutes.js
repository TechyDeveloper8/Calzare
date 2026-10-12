import express from 'express';
import { getNavigationMenus, adminGetAllMenus, adminUpdateMenu } from '../controllers/navigationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getNavigationMenus);

router.get('/admin/all', protect, authorize('admin', 'superadmin', 'editor'), adminGetAllMenus);
router.put('/admin/:menuKey', protect, authorize('admin', 'superadmin', 'editor'), adminUpdateMenu);

export default router;
