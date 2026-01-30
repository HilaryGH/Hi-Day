import express from 'express';
import { register, login, googleLogin, facebookLogin, facebookCallback, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.get('/facebook/callback', facebookCallback);
router.get('/me', protect, getMe);

export default router;






