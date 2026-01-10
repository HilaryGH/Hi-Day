import Promotion from '../models/Promotion.js';
import Product from '../models/Product.js';

// Create promotion
export const createPromotion = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      discountType,
      discountValue,
      maxDiscount,
      startDate,
      endDate,
      categories,
      products,
      image,
      bannerText,
      minPurchaseAmount,
      maxUsagePerUser,
      totalUsageLimit
    } = req.body;

    // Validation
    if (!name || !startDate || !endDate || !discountValue) {
      return res.status(400).json({ message: 'Name, start date, end date, and discount value are required' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const promotion = await Promotion.create({
      name,
      description,
      type: type || 'sale',
      discountType: discountType || 'percentage',
      discountValue,
      maxDiscount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      categories: categories || [],
      products: products || [],
      image,
      bannerText,
      minPurchaseAmount: minPurchaseAmount || 0,
      maxUsagePerUser,
      totalUsageLimit,
      createdBy: req.userId,
      isActive: true
    });

    // Apply promotion to products if specified
    if (products && products.length > 0) {
      await applyPromotionToProducts(promotion._id, products, discountType, discountValue);
    }

    res.status(201).json({
      message: 'Promotion created successfully',
      promotion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all promotions
export const getPromotions = async (req, res) => {
  try {
    const { active, type, page = 1, limit = 20 } = req.query;
    const query = {};

    if (active === 'true') {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    }

    if (type) {
      query.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const promotions = await Promotion.find(query)
      .populate('createdBy', 'name email')
      .populate('products', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Promotion.countDocuments(query);

    res.json({
      promotions,
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

// Get single promotion
export const getPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('products', 'name price images originalPrice');

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update promotion
export const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Only creator, admin, super admin, or marketing team can update
    if (promotion.createdBy.toString() !== req.userId && 
        req.userRole !== 'admin' && 
        req.userRole !== 'super admin' && 
        req.userRole !== 'marketing team') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate dates if provided
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    Object.assign(promotion, req.body);
    
    // Update dates if provided
    if (req.body.startDate) promotion.startDate = new Date(req.body.startDate);
    if (req.body.endDate) promotion.endDate = new Date(req.body.endDate);

    await promotion.save();

    // Update products if discount changed
    if (req.body.discountValue && promotion.products && promotion.products.length > 0) {
      await applyPromotionToProducts(
        promotion._id, 
        promotion.products, 
        promotion.discountType, 
        promotion.discountValue
      );
    }

    await promotion.populate('createdBy', 'name email');
    await promotion.populate('products', 'name price images');

    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete promotion
export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Only admin, super admin, or marketing team can delete
    if (req.userRole !== 'admin' && 
        req.userRole !== 'super admin' && 
        req.userRole !== 'marketing team') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove promotion from products
    await Product.updateMany(
      { promotion: promotion._id },
      { 
        $unset: { promotion: 1 },
        onSale: false,
        salePrice: null,
        saleStartDate: null,
        saleEndDate: null,
        discountPercentage: null
      }
    );

    await promotion.deleteOne();

    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply promotion to products
export const applyPromotionToProducts = async (promotionId, productIds, discountType, discountValue) => {
  try {
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) return;

    const products = await Product.find({ _id: { $in: productIds } });

    for (const product of products) {
      let salePrice = product.price;
      let discountPercentage = 0;

      if (discountType === 'percentage') {
        discountPercentage = discountValue;
        const discountAmount = (product.price * discountValue) / 100;
        salePrice = product.price - discountAmount;
        
        // Apply max discount if specified
        if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
          salePrice = product.price - promotion.maxDiscount;
          discountPercentage = (promotion.maxDiscount / product.price) * 100;
        }
      } else if (discountType === 'fixed_amount') {
        salePrice = Math.max(0, product.price - discountValue);
        discountPercentage = (discountValue / product.price) * 100;
      }

      product.onSale = true;
      product.salePrice = salePrice;
      product.originalPrice = product.price;
      product.price = salePrice; // Update current price
      product.saleStartDate = promotion.startDate;
      product.saleEndDate = promotion.endDate;
      product.promotion = promotionId;
      product.discountPercentage = discountPercentage;

      await product.save();
    }
  } catch (error) {
    console.error('Error applying promotion to products:', error);
  }
};

// Apply promotion to products (endpoint)
export const applyPromotionToProductsEndpoint = async (req, res) => {
  try {
    const { promotionId, productIds } = req.body;

    if (!promotionId || !productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: 'Promotion ID and product IDs array are required' });
    }

    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    await applyPromotionToProducts(
      promotionId,
      productIds,
      promotion.discountType,
      promotion.discountValue
    );

    // Update promotion products list
    promotion.products = [...new Set([...promotion.products.map(p => p.toString()), ...productIds])];
    await promotion.save();

    res.json({ message: 'Promotion applied to products successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove promotion from products
export const removePromotionFromProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: 'Product IDs array is required' });
    }

    await Product.updateMany(
      { _id: { $in: productIds } },
      { 
        $unset: { 
          promotion: 1,
          salePrice: 1,
          saleStartDate: 1,
          saleEndDate: 1,
          discountPercentage: 1
        },
        onSale: false
      }
    );

    // Restore original price if it exists
    const products = await Product.find({ _id: { $in: productIds }, originalPrice: { $exists: true } });
    for (const product of products) {
      if (product.originalPrice) {
        product.price = product.originalPrice;
        await product.save();
      }
    }

    res.json({ message: 'Promotion removed from products successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle promotion active status
export const togglePromotionStatus = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    promotion.isActive = !promotion.isActive;
    await promotion.save();

    // Update products onSale status
    await Product.updateMany(
      { promotion: promotion._id },
      { onSale: promotion.isActive }
    );

    res.json({
      message: `Promotion ${promotion.isActive ? 'activated' : 'deactivated'}`,
      promotion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

