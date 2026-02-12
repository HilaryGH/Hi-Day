import Product from '../models/Product.js';
import { uploadMultipleToCloudinary } from '../cloudinary.js';

// Get all products with filters
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      seller,
      isImported,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = { isActive: true };

    // Category filter - exact match
    if (category) {
      query.category = category.trim();
    }

    // Seller filter
    if (seller) {
      query.seller = seller.trim();
    }

    // Imported products filter
    if (isImported !== undefined) {
      query.isImported = isImported === 'true' || isImported === true;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search filter - search by name, description, and tags
    // If category is already set, search only within that category
    // If category is not set, search across all categories by name, description, tags, and category
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
      if (category) {
        // If category is already filtered, search only by name, description, and tags within that category
        query.$or = [
          { name: searchRegex }, // Search by product name
          { description: searchRegex }, // Search by description
          { tags: searchRegex } // Search in tags array
        ];
      } else {
        // If no category filter, search across all fields including category
        query.$or = [
          { name: searchRegex }, // Search by product name
          { description: searchRegex }, // Search by description
          { category: searchRegex }, // Search by category name
          { tags: searchRegex } // Search in tags array
        ];
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate('seller', '_id name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', '_id name email');
    // Reviews population can be enabled when Review functionality is implemented
    // .populate({
    //   path: 'reviews',
    //   populate: {
    //     path: 'user',
    //     select: 'name avatar'
    //   }
    // });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (seller only)
export const createProduct = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.description || !req.body.price || !req.body.category || !req.body.stock) {
      return res.status(400).json({ message: 'Missing required fields: name, description, price, category, and stock are required' });
    }

    // Validate at least one image
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    // Handle uploaded files - upload to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        // Extract buffers from multer files (when using memory storage, files are in req.files[].buffer)
        const fileBuffers = req.files.map(file => file.buffer);
        
        // Upload all images to Cloudinary
        const uploadResults = await uploadMultipleToCloudinary(fileBuffers, 'products');
        
        // Extract secure URLs from Cloudinary response
        imageUrls = uploadResults.map(result => result.secure_url);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: uploadError.message || 'Failed to upload images. Please try again.' 
        });
      }
    }

    // Parse other fields from req.body (they come as strings from FormData)
    const productData = {
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      price: parseFloat(req.body.price),
      category: req.body.category,
      stock: parseInt(req.body.stock),
      images: imageUrls,
      seller: req.userId
    };

    // Optional fields
    if (req.body.originalPrice) {
      productData.originalPrice = parseFloat(req.body.originalPrice);
    }
    if (req.body.subcategory) {
      productData.subcategory = req.body.subcategory;
    }
    if (req.body.brand) {
      productData.brand = req.body.brand;
    }
    if (req.body.tags) {
      try {
        productData.tags = JSON.parse(req.body.tags);
      } catch (e) {
        // If tags is not JSON, treat it as comma-separated string
        productData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }
    if (req.body.specifications) {
      try {
        productData.specifications = JSON.parse(req.body.specifications);
      } catch (e) {
        // If specifications is not JSON, ignore it
      }
    }
    
    // Allow admin and super admin to mark products as imported
    if (req.userRole === 'admin' || req.userRole === 'super admin') {
      if (req.body.isImported !== undefined) {
        productData.isImported = req.body.isImported === 'true' || req.body.isImported === true;
      }
    }

    const product = await Product.create(productData);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check authorization:
    // - Sellers can edit their own products
    // - Admins can only edit products they own (where they are the seller)
    // - Super admins and marketing team can edit any product
    // Handle seller ID - could be ObjectId, populated object, or string
    let sellerId;
    if (product.seller && typeof product.seller === 'object' && product.seller._id) {
      sellerId = product.seller._id.toString();
    } else if (product.seller) {
      sellerId = product.seller.toString();
    }
    
    // Handle user ID - ensure it's a string for comparison
    const userId = req.userId ? req.userId.toString() : null;
    
    const isOwner = sellerId && userId && sellerId === userId;
    const isSuperAdmin = req.userRole === 'super admin';
    const isMarketingTeam = req.userRole === 'marketing team';
    const isAdmin = req.userRole === 'admin';
    
    // Debug logging (can be removed later)
    console.log('Product update authorization check:', {
      sellerId,
      userId,
      isOwner,
      userRole: req.userRole,
      isAdmin,
      isSuperAdmin,
      isMarketingTeam
    });
    
    if (!isOwner && !isSuperAdmin && !isMarketingTeam) {
      // If user is admin but not the owner, deny access
      if (isAdmin) {
        return res.status(403).json({ 
          message: 'Admins can only edit products they own',
          debug: { sellerId, userId, isOwner }
        });
      }
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Prepare update data
    const updateData = {};

    // Handle text fields from req.body (they come as strings from FormData)
    if (req.body.name !== undefined) {
      updateData.name = req.body.name.trim();
    }
    if (req.body.description !== undefined) {
      updateData.description = req.body.description.trim();
    }
    if (req.body.price !== undefined) {
      updateData.price = parseFloat(req.body.price);
    }
    if (req.body.category !== undefined) {
      updateData.category = req.body.category;
    }
    if (req.body.stock !== undefined) {
      updateData.stock = parseInt(req.body.stock);
    }
    if (req.body.originalPrice !== undefined) {
      if (req.body.originalPrice && req.body.originalPrice.trim() !== '') {
        updateData.originalPrice = parseFloat(req.body.originalPrice);
      } else {
        updateData.originalPrice = undefined;
      }
    }
    if (req.body.subcategory !== undefined) {
      updateData.subcategory = req.body.subcategory.trim() || undefined;
    }
    if (req.body.brand !== undefined) {
      updateData.brand = req.body.brand.trim() || undefined;
    }
    if (req.body.tags !== undefined) {
      try {
        updateData.tags = JSON.parse(req.body.tags);
      } catch (e) {
        // If tags is not JSON, treat it as comma-separated string
        if (req.body.tags && req.body.tags.trim()) {
          updateData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else {
          updateData.tags = [];
        }
      }
    }
    if (req.body.specifications !== undefined) {
      try {
        updateData.specifications = JSON.parse(req.body.specifications);
      } catch (e) {
        // If specifications is not JSON, ignore it
      }
    }

    // Handle image uploads if new images are provided
    if (req.files && req.files.length > 0) {
      try {
        // Extract buffers from multer files
        const fileBuffers = req.files.map(file => file.buffer);
        
        // Upload all images to Cloudinary
        const uploadResults = await uploadMultipleToCloudinary(fileBuffers, 'products');
        
        // Extract secure URLs from Cloudinary response
        const newImageUrls = uploadResults.map(result => result.secure_url);
        
        // If keepExistingImages is true, merge with existing images
        // Otherwise, replace all images with new ones
        if (req.body.keepExistingImages === 'true' && product.images && product.images.length > 0) {
          // Filter existing images to keep only those that should be kept
          // For now, we'll keep all existing and add new ones
          // The frontend should handle removing images before submitting
          const existingToKeep = product.images.filter((img, idx) => {
            // If existingImages array is provided, only keep those
            if (req.body.existingImages) {
              try {
                const existingImagesList = JSON.parse(req.body.existingImages);
                return existingImagesList.includes(img);
              } catch (e) {
                // If parsing fails, keep all existing
                return true;
              }
            }
            return true;
          });
          updateData.images = [...existingToKeep, ...newImageUrls];
        } else {
          updateData.images = newImageUrls;
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: uploadError.message || 'Failed to upload images. Please try again.' 
        });
      }
    } else if (req.body.existingImages) {
      // No new images uploaded, but existing images list provided
      // This means we're only keeping some existing images
      try {
        const existingImagesList = JSON.parse(req.body.existingImages);
        if (Array.isArray(existingImagesList) && existingImagesList.length > 0) {
          updateData.images = existingImagesList;
        }
      } catch (e) {
        // If parsing fails, don't update images
        console.error('Error parsing existingImages:', e);
      }
    }
    
    // Only admin and super admin can update isImported field
    if (req.userRole === 'admin' || req.userRole === 'super admin') {
      if (req.body.isImported !== undefined) {
        updateData.isImported = req.body.isImported === 'true' || req.body.isImported === true;
      }
    }
    
    // Update product fields
    Object.assign(product, updateData);
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check authorization:
    // - Sellers can delete their own products
    // - Admins can only delete products they own (where they are the seller)
    // - Super admins and marketing team can delete any product
    // Handle seller ID - could be ObjectId, populated object, or string
    let sellerId;
    if (product.seller && typeof product.seller === 'object' && product.seller._id) {
      sellerId = product.seller._id.toString();
    } else if (product.seller) {
      sellerId = product.seller.toString();
    }
    
    // Handle user ID - ensure it's a string for comparison
    const userId = req.userId ? req.userId.toString() : null;
    
    const isOwner = sellerId && userId && sellerId === userId;
    const isSuperAdmin = req.userRole === 'super admin';
    const isMarketingTeam = req.userRole === 'marketing team';
    const isAdmin = req.userRole === 'admin';
    
    if (!isOwner && !isSuperAdmin && !isMarketingTeam) {
      // If user is admin but not the owner, deny access
      if (isAdmin) {
        return res.status(403).json({ message: 'Admins can only delete products they own' });
      }
      return res.status(403).json({ message: 'Not authorized' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get best sellers
export const getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    const products = await Product.find({ 
      isActive: true, 
      isBestSeller: true 
    })
      .populate('seller', '_id name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle best seller status (admin/super admin only)
export const toggleBestSeller = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isBestSeller = !product.isBestSeller;
    await product.save();

    res.json({ 
      product, 
      message: product.isBestSeller ? 'Product marked as best seller' : 'Product removed from best sellers' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





