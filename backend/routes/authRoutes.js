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

// Admin customer management
router.get('/admin/users', protect, authorize('admin', 'superadmin', 'customer_support'), adminGetUsers);
router.put('/admin/users/:id/role', protect, authorize('superadmin'), adminUpdateUserRole);

export default router;
