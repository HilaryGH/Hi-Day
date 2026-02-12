import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellers,
  toggleBestSeller
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadProductImages } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/bestsellers', getBestSellers);
router.get('/:id', getProduct);

// Create product with file upload - middleware order: protect -> authorize -> upload -> create
// Note: 'service provider' is allowed temporarily for backward compatibility
// Admin, super admin, and marketing team can create products for promotions/sales
router.post('/', 
  protect, 
  authorize('seller', 'admin', 'super admin', 'product provider', 'service provider', 'marketing team'),
  (req, res, next) => {
    // Handle multer middleware with error handling
    uploadProductImages(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 10MB per image.' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files. Maximum 5 images allowed.' });
          }
          return res.status(400).json({ message: err.message || 'File upload error' });
        }
        return res.status(400).json({ message: err.message || 'File upload error' });
      }
      // No error, continue to next middleware
      next();
    });
  },
  createProduct
);
// Update product with file upload support
router.put('/:id', 
  protect, 
  (req, res, next) => {
    // Handle multer middleware with error handling (optional - images may or may not be included)
    uploadProductImages(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 10MB per image.' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files. Maximum 5 images allowed.' });
          }
          return res.status(400).json({ message: err.message || 'File upload error' });
        }
        return res.status(400).json({ message: err.message || 'File upload error' });
      }
      // No error, continue to next middleware
      next();
    });
  },
  updateProduct
);
router.put('/:id/bestseller', protect, authorize('admin', 'super admin'), toggleBestSeller);
router.delete('/:id', protect, deleteProduct);

export default router;





