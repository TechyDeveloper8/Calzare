import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  adminGetUsers,
  adminUpdateUserRole,
  adminToggleUserStatus,
  adminGetSecurityMetrics,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);

// Admin customer management & security
router.get('/admin/users', protect, authorize('admin', 'superadmin', 'customer_support'), adminGetUsers);
router.put('/admin/users/:id/role', protect, authorize('superadmin'), adminUpdateUserRole);
router.put('/admin/users/:id/status', protect, authorize('admin', 'superadmin'), adminToggleUserStatus);
router.get('/admin/security-status', protect, authorize('admin', 'superadmin'), adminGetSecurityMetrics);

export default router;
