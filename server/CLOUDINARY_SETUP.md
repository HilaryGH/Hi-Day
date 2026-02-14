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

## Deployment Configuration

### Setting Environment Variables in Production

When deploying to platforms like **Render**, **Heroku**, **Vercel**, or **Railway**, you need to set the Cloudinary environment variables in your deployment platform's dashboard:

#### For Render:
1. Go to your Render dashboard
2. Select your service
3. Navigate to **Environment** tab
4. Add the following environment variables:
   - `CLOUDINARY_CLOUD_NAME` = your-cloud-name
   - `CLOUDINARY_API_KEY` = your-api-key
   - `CLOUDINARY_API_SECRET` = your-api-secret
5. Save and redeploy your service

#### For Heroku:
1. Go to your Heroku dashboard
2. Select your app
3. Go to **Settings** → **Config Vars**
4. Add the three Cloudinary environment variables
5. Restart your dynos

#### For Vercel:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the three Cloudinary environment variables
4. Redeploy your application

#### For Railway:
1. Go to your Railway project
2. Select your service
3. Go to **Variables** tab
4. Add the three Cloudinary environment variables
5. Redeploy your service

### Verification

After setting the environment variables and redeploying, check your server logs. You should see:
- ✅ `Cloudinary configured successfully` - if all variables are set correctly
- ⚠️ `Cloudinary configuration error: Missing environment variables` - if any variables are missing

### Troubleshooting

**Error: "Must supply api_key"**
- This means the Cloudinary environment variables are not set in your deployment platform
- Make sure you've added all three variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
- After adding variables, **redeploy** your application for changes to take effect
- Check your deployment platform's documentation for how to set environment variables

**Error: "Cloudinary is not configured"**
- This is a validation error that occurs when trying to upload files without Cloudinary credentials
- Ensure all three environment variables are set in your deployment platform
- Verify the variable names match exactly (case-sensitive)

## Notes

- The old local uploads directory is no longer used
- Existing products with local image URLs will continue to work, but new uploads will use Cloudinary
- All new product images are automatically uploaded to Cloudinary
- **Important**: Environment variables must be set in your deployment platform, not just in your local `.env` file














