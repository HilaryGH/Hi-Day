import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Validate Cloudinary environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Check if all required Cloudinary credentials are present
const isCloudinaryConfigured = cloudName && apiKey && apiSecret;

if (!isCloudinaryConfigured) {
  const missingVars = [];
  if (!cloudName) missingVars.push('CLOUDINARY_CLOUD_NAME');
  if (!apiKey) missingVars.push('CLOUDINARY_API_KEY');
  if (!apiSecret) missingVars.push('CLOUDINARY_API_SECRET');
  
  console.error('⚠️  Cloudinary configuration error: Missing environment variables:', missingVars.join(', '));
  console.error('Please set the following environment variables in your deployment platform:');
  console.error('- CLOUDINARY_CLOUD_NAME');
  console.error('- CLOUDINARY_API_KEY');
  console.error('- CLOUDINARY_API_SECRET');
} else {
  // Configure Cloudinary only if all credentials are present
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log('✅ Cloudinary configured successfully');
}

/**
 * Upload file to Cloudinary (supports images, PDFs, videos)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Folder name in Cloudinary (e.g., 'products', 'users')
 * @param {Object} options - Additional options (e.g., width, height, crop, resource_type)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'products', options = {}) => {
  // Check if Cloudinary is configured before attempting upload
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto', // Auto-detect: image, video, raw (PDF, etc.)
      ...options
    };

    // Use upload_stream for better performance with buffers
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Write the buffer directly to the stream
    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<Buffer>} fileBuffers - Array of file buffers
 * @param {string} folder - Folder name in Cloudinary
 * @param {Object} options - Additional options
 * @returns {Promise<Array<Object>>} - Array of Cloudinary upload results
 */
export const uploadMultipleToCloudinary = async (fileBuffers, folder = 'products', options = {}) => {
  try {
    const uploadPromises = fileBuffers.map(buffer => uploadToCloudinary(buffer, folder, options));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image in Cloudinary
 * @returns {Promise<Object>} - Cloudinary delete result
 */
export const deleteFromCloudinary = async (publicId) => {
  // Check if Cloudinary is configured before attempting delete
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw error;
  }
};

export default cloudinary;
