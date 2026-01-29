import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendOrderConfirmationToCustomer, sendOrderNotificationToSeller } from '../utils/emailService.js';

// Create order from cart or direct purchase
export const createOrder = async (req, res) => {
  try {
    const {
      items, // For direct purchase: [{ productId, quantity }]
      shippingAddress,
      paymentMethod,
      shippingCost = 0,
      useCart = false // If true, use items from cart, otherwise use items from request
    } = req.body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    let orderItems = [];

    if (useCart) {
      // Get items from cart
      const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Validate stock and prepare order items
      for (const cartItem of cart.items) {
        // cartItem.product might be populated (object) or just an ID
        const productId = cartItem.product._id || cartItem.product;
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
          return res.status(400).json({ message: `Product ${product?.name || 'Unknown'} is no longer available` });
        }
        if (product.stock < cartItem.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }

        orderItems.push({
          product: product._id,
          quantity: cartItem.quantity,
          price: product.price
        });
      }

      // Update product stock after validation
      for (const cartItem of cart.items) {
        const productId = cartItem.product._id || cartItem.product;
        const product = await Product.findById(productId);
        if (product) {
          product.stock -= cartItem.quantity;
          await product.save();
        }
      }
    } else {
      // Use items from request (direct purchase)
      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Items are required' });
      }

      // Validate stock and prepare order items
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product || !product.isActive) {
          return res.status(400).json({ message: `Product ${product?.name || 'Unknown'} is not available` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price
        });
      }

      // Update product stock after validation
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }
    }

    // Calculate total amount
    const totalAmount = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0) + shippingCost;

    // Generate order number based on category
    // Get category from first product
    const firstProductId = orderItems[0].product;
    const firstProduct = await Product.findById(firstProductId);
    let categoryPrefix = 'ORD'; // Default prefix
    
    if (firstProduct && firstProduct.category) {
      // Extract first 3 letters from category name
      // Remove spaces, special characters, and take only letters
      const categoryName = firstProduct.category.replace(/[^a-zA-Z]/g, ''); // Remove non-letters
      
      if (categoryName.length >= 3) {
        categoryPrefix = categoryName.substring(0, 3).toUpperCase();
      } else if (categoryName.length > 0) {
        // If category name is less than 3 letters, pad with first letter repeated
        const firstLetter = categoryName[0].toUpperCase();
        categoryPrefix = (categoryName.toUpperCase() + firstLetter.repeat(3 - categoryName.length)).substring(0, 3);
      }
    }
    
    // Generate 6-digit random number (ensure it's always 6 digits)
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    const orderNumber = `${categoryPrefix}${randomDigits}`;
    
    // Ensure uniqueness by checking if order number already exists
    let finalOrderNumber = orderNumber;
    let attempts = 0;
    while (attempts < 10) {
      const existingOrder = await Order.findOne({ orderNumber: finalOrderNumber });
      if (!existingOrder) {
        break;
      }
      // If exists, generate new random digits
      const newRandomDigits = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
      finalOrderNumber = `${categoryPrefix}${newRandomDigits}`;
      attempts++;
    }

    // Create order
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || shippingAddress.region || '',
        zipCode: shippingAddress.zipCode || shippingAddress.postalCode || '',
        country: shippingAddress.country || 'Ethiopia',
        phone: shippingAddress.phone
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
      orderStatus: 'pending',
      totalAmount,
      shippingCost,
      orderNumber: finalOrderNumber
    });

    // Clear cart if order was created from cart
    if (useCart) {
      await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });
    }

    // Populate order with user and product details including sellers
    await order.populate('user', 'name email');
    await order.populate({
      path: 'items.product',
      populate: { path: 'seller', select: 'name email _id' }
    });

    // Send email to customer
    if (order.user?.email) {
      sendOrderConfirmationToCustomer(order, order.user.email, order.user.name || 'Customer');
    }

    // Send emails to sellers (get unique sellers from order items)
    const sellerMap = new Map();
    
    order.items.forEach(item => {
      const seller = item.product?.seller;
      if (seller) {
        const sellerId = seller._id?.toString() || seller.toString();
        if (!sellerMap.has(sellerId) && seller.email) {
          sellerMap.set(sellerId, {
            email: seller.email,
            name: seller.name || 'Seller',
            _id: sellerId
          });
        }
      }
    });

    // Send email to each unique seller
    for (const [sellerId, sellerInfo] of sellerMap) {
      try {
        sendOrderNotificationToSeller(order, sellerInfo.email, sellerId);
      } catch (error) {
        console.error(`Error sending email to seller ${sellerId}:`, error);
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images category')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.userId && req.userRole !== 'admin' && req.userRole !== 'super admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get seller orders (orders containing products from this seller)
export const getSellerOrders = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, page = 1, limit = 50 } = req.query;
    
    // Get all orders and filter by seller's products
    const query = {};
    
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Get all orders first, then filter by seller
    const allOrders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate({
        path: 'items.product',
        populate: { path: 'seller', select: 'name email _id' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit) * 2); // Get more to filter

    // Filter orders that contain products from this seller
    const sellerOrders = allOrders.filter(order => 
      order.items.some(item => {
        const sellerId = item.product?.seller?._id?.toString() || item.product?.seller?.toString();
        return sellerId === req.userId.toString();
      })
    ).slice(0, Number(limit));

    const total = await Order.countDocuments(query);
    // Note: This is approximate since we filter after querying
    // For better performance, you might want to add a seller field to orders or use aggregation

    res.json({
      orders: sellerOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: sellerOrders.length, // Approximate
        pages: Math.ceil(sellerOrders.length / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin, super admin, or seller for their products)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.product',
        populate: { path: 'seller', select: '_id' }
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Admin and super admin can update any order
    const isAdmin = req.userRole === 'admin' || req.userRole === 'super admin';
    
    // For sellers, check if this order contains their products
    let isSellerOfOrder = false;
    if (!isAdmin && (req.userRole === 'product provider' || req.userRole === 'seller' || req.userRole === 'service provider')) {
      isSellerOfOrder = order.items.some(item => {
        const sellerId = item.product?.seller?._id?.toString() || item.product?.seller?.toString();
        return sellerId === req.userId.toString();
      });
    }

    if (!isAdmin && !isSellerOfOrder) {
      return res.status(403).json({ message: 'Not authorized. You can only update orders containing your products.' });
    }

    // Validate order status transitions
    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [], // Final state
      'cancelled': [] // Final state
    };

    if (orderStatus && order.orderStatus !== orderStatus) {
      const allowedStatuses = validTransitions[order.orderStatus] || [];
      // Admins can set any status, sellers follow the workflow
      if (!isAdmin && !allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({ 
          message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}. Valid transitions: ${allowedStatuses.join(', ')}` 
        });
      }
      order.orderStatus = orderStatus;
    }

    // Only admins can update payment status
    if (paymentStatus && isAdmin) {
      order.paymentStatus = paymentStatus;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();
    await order.populate('items.product', 'name images');
    await order.populate('user', 'name email');

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

