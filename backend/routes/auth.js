const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendVerificationEmail, sendNotificationEmail } = require('../services/emailService');

const router = express.Router();

// ============ SIGNUP ============
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create verification token
    const verificationToken = uuidv4();
    const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      verificationToken,
      verificationExpiry
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, firstName, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Signup successful! Please verify your email',
      userId: user._id
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during signup',
      error: error.message
    });
  }
});

// ============ VERIFY EMAIL ============
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      verificationToken: token,
      verificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
});

// ============ LOGIN ============
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user and get password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// ============ RESEND VERIFICATION EMAIL ============
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new token
    user.verificationToken = uuidv4();
    user.verificationExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send email
    await sendVerificationEmail(email, user.firstName, user.verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resending verification email',
      error: error.message
    });
  }
});

// ============ LOGOUT ============
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;