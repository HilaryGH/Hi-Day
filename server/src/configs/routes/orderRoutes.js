import express from 'express';
import {
  createOrder,
  getUserOrders,
  getSellerOrders,
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

// Get seller's orders (orders containing seller's products)
router.get('/seller-orders', getSellerOrders);

// Get single order
router.get('/:id', getOrder);

// Update order status (admin, super admin, or seller for their orders)
router.put('/:id/status', updateOrderStatus);

export default router;




