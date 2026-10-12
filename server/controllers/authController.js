const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to determine role based on configuration
const getTargetRole = (email, currentRole = 'student') => {
  if (!email) return currentRole;
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'amitmanmode01@gmail.com')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim());
  const counselorEmails = (process.env.COUNSELOR_EMAILS || process.env.COUNSELOR_EMAIL || 'amitmanmode42@gmail.com,counselor@mitsgwl.ac.in')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim());

  if (adminEmails.includes(email.toLowerCase())) return 'admin';
  if (counselorEmails.includes(email.toLowerCase())) return 'counselor';
  return currentRole;
};

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(', '),
      });
    }

    const { name, email, enrollmentNo, password, branch, year, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, ...(enrollmentNo ? [{ enrollmentNo }] : [])],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === email
            ? 'Email already registered.'
            : 'Enrollment number already registered.',
      });
    }

    // Only students can register via public route
    const user = await User.create({
      name,
      email,
      enrollmentNo,
      password,
      role: 'student', // force student role on public registration
      branch: branch || '',
      year: year || '',
      gender: gender || '',
    });

    const token = generateToken(user._id, user.role);

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(', '),
      });
    }

    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const targetRole = getTargetRole(email, user.role);
    if (user.role !== targetRole) {
      user.role = targetRole;
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const targetRole = getTargetRole(req.user.email, req.user.role);
  if (req.user.role !== targetRole) {
    req.user.role = targetRole;
    await req.user.save();
  }
  res.status(200).json({
    success: true,
    data: { user: req.user.toJSON() },
  });
};

// @desc    Login/Register user via Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential missing.' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const targetRole = getTargetRole(email, 'student');

    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        role: targetRole,
        isActive: true,
      });
    } else {
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact admin.',
        });
      }
      let shouldSave = false;
      // If user exists but doesn't have googleId linked, update it
      if (!user.googleId) {
        user.googleId = googleId;
        shouldSave = true;
      }
      // Elevate or sync role if needed
      const expectedRole = getTargetRole(email, user.role);
      if (user.role !== expectedRole) {
        user.role = expectedRole;
        shouldSave = true;
      }
      if (shouldSave) {
        await user.save();
      }
    }

    const token = generateToken(user._id, user.role);

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Google login successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, googleLogin };
