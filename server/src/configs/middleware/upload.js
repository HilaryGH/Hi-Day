import multer from 'multer';
import path from 'path';

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// File filter for images and PDFs
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image|application\/pdf/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) and PDF files are allowed!'));
  }
};

// File filter for all file types (images, PDFs, videos)
const allFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|mp4|mov|avi|wmv|flv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image|application\/pdf|video/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files, PDF files, and video files are allowed!'));
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
  fileFilter: imageFileFilter
}).array('images', 5); // Allow up to 5 images

// Configure multer for single image upload
export const uploadSingleImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: imageFileFilter
}).single('image');

// Configure multer for logo upload
export const uploadLogo = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: imageFileFilter
}).single('logo');

// Configure multer for registration files (multiple fields with different file types)
// Using .any() to accept all fields (both files and text fields)
export const uploadRegistrationFiles = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file (for videos and large PDFs)
    files: 20 // Maximum number of files total
  },
  fileFilter: allFileFilter
}).any();
