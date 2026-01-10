import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

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
      shippingCost
    });

    // Clear cart if order was created from cart
    if (useCart) {
      await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });
    }

    await order.populate('items.product', 'name images');

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

// Update order status (admin or seller)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only admin, super admin, or the seller can update order status
    // For now, only admin can update. Later, we can add seller check.
    if (req.userRole !== 'admin' && req.userRole !== 'super admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();
    await order.populate('items.product', 'name images');

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

