import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
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

// Get single user
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (verify, change role, etc.)
export const updateUser = async (req, res) => {
  try {
    const { isVerified, role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isVerified !== undefined) {
      user.isVerified = isVerified;
    }
    if (role) {
      user.role = role;
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting admin users
    if (user.role === 'admin' || user.role === 'super admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Delete all products by this user
    await Product.deleteMany({ seller: user._id });

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify provider
export const verifyProvider = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'product provider' && user.role !== 'service provider' && user.role !== 'seller') {
      return res.status(400).json({ message: 'User is not a provider' });
    }

    user.isVerified = true;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: 'Provider verified successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const providerRoles = ['product provider', 'service provider', 'seller'];
    
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ 
      role: { $in: providerRoles } 
    });
    const verifiedProviders = await User.countDocuments({ 
      role: { $in: providerRoles },
      isVerified: true 
    });
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const pendingVerification = await User.countDocuments({ 
      role: { $in: providerRoles },
      isVerified: false 
    });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });

    res.json({
      stats: {
        totalUsers,
        totalProviders,
        verifiedProviders,
        pendingVerification,
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products (admin view)
export const getAllProducts = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      isActive,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate('seller', 'name email role isVerified')
      .sort({ createdAt: -1 })
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

// Delete product (admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle product active status
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({ message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { 
      orderStatus, 
      paymentStatus,
      search, 
      page = 1, 
      limit = 50 
    } = req.query;

    const query = {};

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      // Search by order ID or customer name/email
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images seller')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
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

// Get top sellers (based on product sales and ratings)
export const getTopSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    // Get sellers with their products - prioritize verified but include all active sellers
    const sellerRoles = ['seller', 'product provider'];
    
    // First try to get verified sellers
    let sellers = await User.find({ 
      role: { $in: sellerRoles },
      isActive: true,
      isVerified: true
    })
      .select('name companyName location city avatar isVerified role email phone')
      .limit(limit * 3);
    
    // If not enough verified sellers, include unverified ones too
    if (sellers.length < limit) {
      const additionalSellers = await User.find({ 
        role: { $in: sellerRoles },
        isActive: true,
        isVerified: false,
        _id: { $nin: sellers.map(s => s._id) }
      })
        .select('name companyName location city avatar isVerified role email phone')
        .limit(limit * 3 - sellers.length);
      
      sellers = [...sellers, ...additionalSellers];
    }

    // Get all orders to calculate seller performance
    const allOrders = await Order.find({
      orderStatus: { $in: ['delivered', 'shipped', 'processing'] }
    }).populate('items.product', 'seller');

    // Get products for each seller and calculate stats
    const sellersWithStats = await Promise.all(
      sellers.map(async (seller) => {
        // Count products
        const productCount = await Product.countDocuments({ 
          seller: seller._id,
          isActive: true 
        });

        // Get products to calculate average rating and find order count
        const products = await Product.find({ 
          seller: seller._id,
          isActive: true 
        }).select('_id rating');

        const productIds = products.map(p => p._id.toString());

        // Calculate average rating across all products
        let totalRating = 0;
        let totalReviews = 0;
        products.forEach(product => {
          if (product.rating && product.rating.average) {
            totalRating += product.rating.average * product.rating.count;
            totalReviews += product.rating.count;
          }
        });
        const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;

        // Count orders that contain at least one product from this seller
        let orderCount = 0;
        allOrders.forEach(order => {
          const hasSellerProduct = order.items.some(item => 
            item.product && productIds.includes(item.product._id.toString())
          );
          if (hasSellerProduct) {
            orderCount++;
          }
        });

        return {
          ...seller.toObject(),
          productCount,
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalReviews,
          orderCount,
          score: (orderCount * 10) + (avgRating * 2) + productCount // Simple scoring
        };
      })
    );

    // Sort by score and limit
    const topSellers = sellersWithStats
      .filter(seller => seller.productCount > 0) // Only sellers with products
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...seller }) => seller); // Remove score from response

    res.json({ sellers: topSellers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order statistics for dashboard
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });
    
    // Calculate total revenue from delivered orders
    const revenueData = await Order.aggregate([
      { $match: { orderStatus: 'delivered', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get pending payment amount
    const pendingPaymentData = await Order.aggregate([
      { $match: { paymentStatus: 'pending' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const pendingPayment = pendingPaymentData.length > 0 ? pendingPaymentData[0].total : 0;

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        pendingPayment
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

