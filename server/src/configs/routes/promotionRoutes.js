import express from 'express';
import {
  createPromotion,
  getPromotions,
  getPromotion,
  updatePromotion,
  deletePromotion,
  applyPromotionToProductsEndpoint,
  removePromotionFromProducts,
  togglePromotionStatus
} from '../controllers/promotionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPromotions);
router.get('/:id', getPromotion);

// Protected routes - only admin, super admin, and marketing team can manage promotions
router.use(protect);

router.post(
  '/',
  authorize('admin', 'super admin', 'marketing team'),
  createPromotion
);

router.put(
  '/:id',
  authorize('admin', 'super admin', 'marketing team'),
  updatePromotion
);

router.delete(
  '/:id',
  authorize('admin', 'super admin', 'marketing team'),
  deletePromotion
);

router.post(
  '/apply-to-products',
  authorize('admin', 'super admin', 'marketing team'),
  applyPromotionToProductsEndpoint
);

router.post(
  '/remove-from-products',
  authorize('admin', 'super admin', 'marketing team'),
  removePromotionFromProducts
);

router.put(
  '/:id/toggle-status',
  authorize('admin', 'super admin', 'marketing team'),
  togglePromotionStatus
);

export default router;



