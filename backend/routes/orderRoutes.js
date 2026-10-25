import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminShipWithFShip,
  adminCancelOrder,
  razorpayWebhook,
  trackOrder,
} from '../controllers/orderController.js';
import { protect, optionalAuth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Order tracking (public endpoint with order number & contact verification)
router.post('/track', trackOrder);

// Razorpay asynchronous server-to-server webhook callback
router.post('/webhook/razorpay', razorpayWebhook);

// Order creation & payment verification (supports guests and authenticated customers)
router.post('/checkout', optionalAuth, createOrder);
router.post('/verify-payment', optionalAuth, verifyPayment);

// Customer order history & detail
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);

// Admin fulfillment
router.get('/admin/all', protect, authorize('admin', 'superadmin', 'order_manager'), adminGetAllOrders);
router.put('/admin/:id/status', protect, authorize('admin', 'superadmin', 'order_manager'), adminUpdateOrderStatus);
router.post('/admin/:id/fship-ship', protect, authorize('admin', 'superadmin', 'order_manager'), adminShipWithFShip);
router.put('/admin/:id/cancel', protect, authorize('admin', 'superadmin', 'order_manager'), adminCancelOrder);

export default router;
