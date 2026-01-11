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
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search filter - search by name, description, tags, and category
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
      query.$or = [
        { name: searchRegex }, // Search by product name
        { description: searchRegex }, // Search by description
        { category: searchRegex }, // Search by category
        { tags: searchRegex } // Search in tags array (MongoDB matches regex against array elements)
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate('seller', 'name email')
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
      .populate('seller', 'name email');
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

    // Check if user is seller, admin, super admin, or marketing team
    if (product.seller.toString() !== req.userId && 
        req.userRole !== 'admin' && 
        req.userRole !== 'super admin' && 
        req.userRole !== 'marketing team') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(product, req.body);
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

    if (product.seller.toString() !== req.userId && 
        req.userRole !== 'admin' && 
        req.userRole !== 'super admin' && 
        req.userRole !== 'marketing team') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





