import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId })
      .populate({
        path: 'items.product',
        select: 'name price images stock isActive'
      });

    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [] });
    }

    // Filter out items with null, deleted, or inactive products
    if (cart.items && cart.items.length > 0) {
      const validItems = cart.items.filter(item => {
        // Check if product exists and is populated (not null)
        if (!item.product) return false;
        
        // If product is an object (populated), check if it's active
        if (typeof item.product === 'object' && item.product._id) {
          // Product is populated, check if active
          return item.product.isActive !== false;
        }
        
        // Product ID exists but not populated (shouldn't happen, but handle it)
        return true;
      });
      
      // Only update if we removed items
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
        // Re-populate after filtering
        await cart.populate({
          path: 'items.product',
          select: 'name price images stock isActive'
        });
      }
    }

    // Ensure items array exists and is an array
    if (!cart.items || !Array.isArray(cart.items)) {
      cart.items = [];
    }

    // Convert to plain object to ensure proper JSON serialization
    const cartData = cart.toObject ? cart.toObject() : cart;
    
    res.json(cartData);
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const product = await Product.findById(item.product);
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

















