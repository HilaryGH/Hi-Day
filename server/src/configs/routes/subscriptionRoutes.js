import express from 'express';
import { subscribe, unsubscribe } from '../controllers/subscriptionController.js';

const router = express.Router();

// Public routes - no authentication required
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

export default router;

