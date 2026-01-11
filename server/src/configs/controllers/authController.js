import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

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

// Google OAuth Login
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    // Initialize Google OAuth client
    // Note: Update .env file to use GOOGLE_CLIENT_ID instead of "Client ID" (spaces not supported)
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '99344341424-dfr39pbsip8a7j7008d037ulvhndjpk1.apps.googleusercontent.com';
    const client = new OAuth2Client(googleClientId);

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (picture && !user.avatar) {
          user.avatar = picture;
        }
        await user.save();
      } else {
        // Create new user with Google OAuth
        user = await User.create({
          googleId,
          email,
          name,
          avatar: picture || '',
          role: 'individual', // Always set role to 'individual' for Google OAuth users
          privacyConsent: true,
          isVerified: true, // Google accounts are pre-verified
        });
      }
    } else {
      // Update avatar if not set
      if (picture && !user.avatar) {
        user.avatar = picture;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
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


