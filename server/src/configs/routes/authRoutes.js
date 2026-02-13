import express from 'express';
import multer from 'multer';
import { register, login, googleLogin, facebookLogin, facebookCallback, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadLogo, uploadRegistrationFiles } from '../middleware/upload.js';

const router = express.Router();

// Register with file uploads (all files go to Cloudinary)
router.post('/register', 
  (req, res, next) => {
    // Only use multer if the request is multipart/form-data (for file uploads)
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      // Handle multer middleware with error handling (all files are optional)
      uploadRegistrationFiles(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({ message: 'File size too large. Maximum size is 50MB per file.' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
              return res.status(400).json({ message: 'Too many files uploaded.' });
            }
            return res.status(400).json({ message: err.message || 'File upload error' });
          }
          return res.status(400).json({ message: err.message || 'File upload error' });
        }
        next();
      });
    } else {
      // For JSON requests, skip multer and go directly to register
      next();
    }
  },
  register
);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.get('/facebook/callback', facebookCallback);
router.get('/me', protect, getMe);

export default router;






