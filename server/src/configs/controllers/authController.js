import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// Register
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      alternativePhone,
      whatsapp,
      telegram,
      address,
      city,
      location,
      referralCode,
      providerType,
      companyName,
      serviceType,
      workExperience,
      gender,
      privacyConsent
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Valid roles
    const validRoles = ['buyer', 'seller', 'admin', 'super admin', 'product provider', 'individual', 'marketing team', 'customer support', 'support team'];
    
    // Validate role if provided
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Valid roles are: ${validRoles.join(', ')}` });
    }

    // Validate privacy consent
    if (!privacyConsent) {
      return res.status(400).json({ message: 'Privacy consent is required' });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      role: role || 'individual',
      phone,
      alternativePhone,
      whatsapp,
      telegram,
      address,
      city,
      location,
      referralCode,
      providerType,
      companyName,
      serviceType,
      workExperience: workExperience ? parseInt(workExperience) : 0,
      gender,
      privacyConsent: true
    };

    // Remove undefined fields
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined || userData[key] === '') {
        delete userData[key];
      }
    });

    const user = await User.create(userData);

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


