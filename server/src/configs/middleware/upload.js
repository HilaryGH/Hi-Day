import multer from 'multer';
import path from 'path';

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Configure multer with memory storage (files will be stored in memory as buffers)
// This allows us to upload directly to Cloudinary without saving to disk first
const memoryStorage = multer.memoryStorage();

// Configure multer for product images (multiple files)
export const uploadProductImages = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file (Cloudinary supports larger files)
  },
  fileFilter: fileFilter
}).array('images', 5); // Allow up to 5 images

// Configure multer for single image upload
export const uploadSingleImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
}).single('image');

// Configure multer for logo upload
export const uploadLogo = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
}).single('logo');