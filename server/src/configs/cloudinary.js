import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary (supports images, PDFs, videos)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Folder name in Cloudinary (e.g., 'products', 'users')
 * @param {Object} options - Additional options (e.g., width, height, crop, resource_type)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'products', options = {}) => {
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
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw error;
  }
};

export default cloudinary;
