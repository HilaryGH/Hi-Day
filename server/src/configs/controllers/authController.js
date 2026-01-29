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

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
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

    // Validate password if provided (not required for Google OAuth users)
    if (!req.body.googleId && (!password || password.length < 6)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
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
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Handle duplicate key errors (e.g., duplicate email)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
    }
    
    // Log the error for debugging
    console.error('Registration error:', error);
    
    // Return generic error message
    res.status(500).json({ 
      message: error.message || 'An error occurred during registration. Please try again.' 
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user has a password (Google OAuth users might not have one)
    if (!user.password) {
      return res.status(401).json({ message: 'Please use Google login for this account' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
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
    console.error('Login error:', error);
    res.status(500).json({ 
      message: error.message || 'An error occurred during login. Please try again.' 
    });
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
    const googleClientId = process.env.GOOGLE_CLIENT_ID ;
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

// Facebook OAuth Login
export const facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // Verify the access token with Facebook Graph API
    const facebookAppId = process.env.FACEBOOK_APP_ID;
    const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;

    if (!facebookAppId || !facebookAppSecret) {
      return res.status(500).json({ message: 'Facebook credentials not configured' });
    }

    // First, verify the token and get app info
    const debugTokenResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${facebookAppId}|${facebookAppSecret}`
    );

    if (!debugTokenResponse.ok) {
      return res.status(401).json({ message: 'Invalid Facebook access token' });
    }

    const debugTokenData = await debugTokenResponse.json();
    
    if (!debugTokenData.data || !debugTokenData.data.is_valid) {
      return res.status(401).json({ message: 'Invalid Facebook access token' });
    }

    const facebookId = debugTokenData.data.user_id;

    // Get user info from Facebook Graph API
    const userInfoResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    if (!userInfoResponse.ok) {
      return res.status(401).json({ message: 'Failed to fetch user info from Facebook' });
    }

    const userInfo = await userInfoResponse.json();
    const { email, name, picture } = userInfo;
    const profilePicture = picture?.data?.url || '';

    // Check if user exists with this Facebook ID
    let user = await User.findOne({ facebookId });

    if (!user) {
      // Check if user exists with this email
      if (email) {
        user = await User.findOne({ email });

        if (user) {
          // Link Facebook account to existing user
          user.facebookId = facebookId;
          if (profilePicture && !user.avatar) {
            user.avatar = profilePicture;
          }
          await user.save();
        }
      }

      if (!user) {
        // Create new user with Facebook OAuth
        user = await User.create({
          facebookId,
          email: email || `${facebookId}@facebook.com`, // Fallback email if not provided
          name: name || 'Facebook User',
          avatar: profilePicture || '',
          role: 'buyer', // Set role to 'buyer' for Facebook OAuth users as requested
          privacyConsent: true,
          isVerified: true, // Facebook accounts are pre-verified
        });
      }
    } else {
      // Update avatar if not set
      if (profilePicture && !user.avatar) {
        user.avatar = profilePicture;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Facebook login successful',
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
    console.error('Facebook login error:', error);
    res.status(500).json({ message: 'Facebook authentication failed', error: error.message });
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


