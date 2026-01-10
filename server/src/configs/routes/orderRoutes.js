import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Create order (for both cart checkout and direct purchase)
router.post('/', createOrder);

// Get user's orders
router.get('/my-orders', getUserOrders);

// Get single order
router.get('/:id', getOrder);

// Update order status (admin only)
router.put('/:id/status', authorize('admin', 'super admin'), updateOrderStatus);

export default router;

