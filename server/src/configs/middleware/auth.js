import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // Debug logging (remove in production)
    console.log('Authorization check:', {
      userRole: req.userRole,
      userId: req.userId,
      requiredRoles: roles
    });
    
    if (!req.userRole) {
      return res.status(403).json({ message: 'User role not found. Please log in again.' });
    }
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ 
        message: `Not authorized for this action. Your role: ${req.userRole}. Required roles: ${roles.join(', ')}`,
        userRole: req.userRole,
        requiredRoles: roles
      });
    }
    next();
  };
};





