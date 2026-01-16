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

