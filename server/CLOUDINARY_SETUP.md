# Cloudinary Setup Guide

## Overview

This project uses Cloudinary for image and file uploads. All product images are now stored on Cloudinary instead of local file storage.

## Environment Variables

Add these variables to your `.env` file in the `server` directory:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Getting Cloudinary Credentials

1. Sign up for a free account at [https://cloudinary.com](https://cloudinary.com)
2. Go to your dashboard: [https://cloudinary.com/console](https://cloudinary.com/console)
3. Copy your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

## Setup Instructions

1. Install dependencies (if not already installed):
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in the `server` directory (if it doesn't exist)

3. Add your Cloudinary credentials to the `.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. Restart your server for changes to take effect

## How It Works

- When products are created with images, the images are uploaded to Cloudinary
- Images are stored in the `products` folder on Cloudinary
- The Cloudinary URLs are saved in the database
- Images are automatically optimized and delivered via CDN

## File Upload Configuration

- Maximum file size: 10MB per image
- Maximum images per product: 5
- Supported formats: JPEG, JPG, PNG, GIF, WEBP
- Storage: Cloudinary cloud storage

## Notes

- The old local uploads directory is no longer used
- Existing products with local image URLs will continue to work, but new uploads will use Cloudinary
- All new product images are automatically uploaded to Cloudinary







