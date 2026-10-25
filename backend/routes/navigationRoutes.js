import express from 'express';
import { getNavigationMenus, adminGetAllMenus, adminUpdateMenu } from '../controllers/navigationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { cacheResponse, invalidateCache } from '../middleware/cacheMiddleware.js';

const router = express.Router();

const purgeNavCache = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCache('/api/v1/navigation');
    }
  });
  next();
};

// Navigation menus (cached 120s in memory, 60s browser, 300s CDN)
router.get('/', cacheResponse(120, 60, 300), getNavigationMenus);

router.get('/admin/all', protect, authorize('admin', 'superadmin', 'editor'), adminGetAllMenus);
router.put('/admin/:menuKey', protect, authorize('admin', 'superadmin', 'editor'), purgeNavCache, adminUpdateMenu);

export default router;
