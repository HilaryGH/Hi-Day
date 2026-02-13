import express from 'express';
import {
  getAllUsers,
  getUser,
  getUserDocuments,
  updateUser,
  deleteUser,
  verifyProvider,
  getDashboardStats,
  getAllProducts,
  deleteProduct,
  toggleProductStatus,
  getAllOrders,
  getOrderStats,
  getTopSellers
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route - Top sellers (no authentication required)
router.get('/top-sellers', getTopSellers);

// Dashboard stats - requires authentication and admin role
router.get('/stats', protect, authorize('admin', 'super admin'), getDashboardStats);

// User management - requires authentication and admin role
router.get('/users', protect, authorize('admin', 'super admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin', 'super admin'), getUser);
router.get('/users/:id/documents', protect, authorize('admin', 'super admin'), getUserDocuments);
router.put('/users/:id', protect, authorize('admin', 'super admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin', 'super admin'), deleteUser);

// Provider verification - requires authentication and admin role
router.put('/providers/:id/verify', protect, authorize('admin', 'super admin'), verifyProvider);

// Product management - requires authentication and admin role
router.get('/products', protect, authorize('admin', 'super admin'), getAllProducts);
router.delete('/products/:id', protect, authorize('admin', 'super admin'), deleteProduct);
router.put('/products/:id/toggle', protect, authorize('admin', 'super admin'), toggleProductStatus);

// Order management - requires authentication and admin role
router.get('/orders', protect, authorize('admin', 'super admin'), getAllOrders);
router.get('/orders/stats', protect, authorize('admin', 'super admin'), getOrderStats);

export default router;

