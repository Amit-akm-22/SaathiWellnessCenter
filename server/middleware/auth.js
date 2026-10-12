const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header first (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Then check httpOnly cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always fetch fresh user from DB (catches deactivation, deletion, token invalidation)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in again.',
      });
    }

    // Check soft delete
    if (user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: 'Account has been removed. Please contact support.',
      });
    }

    // Check deactivated
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.',
      });
    }

    // Check token version (invalidated on password reset or role change)
    const tokenVersion = decoded.tokenVersion || 0;
    const dbTokenVersion = user.tokenVersion || 0;
    if (tokenVersion !== dbTokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session invalidated. Please log in again.',
      });
    }

    // Sync role with environment configuration if needed
    const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'amitmanmode01@gmail.com')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim());
    const counselorEmails = (process.env.COUNSELOR_EMAILS || process.env.COUNSELOR_EMAIL || 'amitmanmode42@gmail.com,counselor@mitsgwl.ac.in')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim());

    if (adminEmails.includes(user.email.toLowerCase()) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    } else if (counselorEmails.includes(user.email.toLowerCase()) && user.role !== 'counselor') {
      user.role = 'counselor';
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.',
    });
  }
};

// Role-based access control - generic, works for any role
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
