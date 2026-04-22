/* ================================
   ZALAMS LUXURY — AUTH ROUTES
   src/routes/auth.js
================================ */

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail } from '../config/email.js';

const router = express.Router();


// --- Helper: Generate JWT Token ---
function generateToken(userId) {
  return jwt.sign(
    { userId },                           // Payload — what we store in token
    process.env.JWT_SECRET,              // Secret key to sign token
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // Token expires in 7 days
  );
}


// --- POST /api/auth/signup ---
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create user (password gets hashed automatically by pre save hook)
    const user = await User.create({ name, email, password });
    // Send welcome email
    sendEmail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to Zalams Luxury! 🎉',
      html: `
        <div style="font-family:Arial;max-width:600px;margin:0 auto;
          background:#111;color:#fff;padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="font-size:2rem;letter-spacing:0.12em;color:#fff;margin:0;">
              ZALAM<span style="color:#c9a84c;">S</span>
            </h1>
          </div>
          <h2 style="color:#c9a84c;text-transform:uppercase;
            letter-spacing:0.08em;">
            Welcome, ${user.name}!
          </h2>
          <p style="color:#888;line-height:1.8;margin:16px 0;">
            Thank you for joining Zalams Luxury. Your account has been
            created successfully.
          </p>
          <p style="color:#888;line-height:1.8;">
            You can now shop our premium collection, track your orders
            and manage your account.
          </p>
          <div style="margin:32px 0;">
            <a href="${process.env.FRONTEND_URL}/shop.html"
              style="display:inline-block;padding:14px 32px;
              background:#c9a84c;color:#000;font-weight:bold;
              text-decoration:none;text-transform:uppercase;
              letter-spacing:0.1em;font-size:0.85rem;">
              Shop Now →
            </a>
          </div>
          <div style="border-top:1px solid #222;padding-top:20px;
            margin-top:20px;">
            <p style="color:#555;font-size:0.72rem;text-align:center;">
              © 2026 Zalams Luxury · hello@zalams.com
            </p>
          </div>
        </div>
      `
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not create account',
      error: error.message
    });
  }
});


// --- POST /api/auth/login ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user and include password (select: false hides it by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
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
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});


// --- GET /api/auth/me ---
// Get current logged in user
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not logged in'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});


// --- POST /api/auth/logout ---
router.post('/logout', (req, res) => {
  // JWT is stateless so logout just means
  // telling the frontend to delete the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// --- PUT /api/auth/update-profile ---
router.put('/update-profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, address } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { name, address },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update profile',
      error: error.message
    });
  }
});

// --- PATCH /api/auth/make-admin ---
router.patch('/make-admin', async (req, res) => {
  try {
    const { email, secretKey } = req.body;

    if (secretKey !== 'zalams-admin-secret-2026') {
      return res.status(403).json({
        success: false,
        message: 'Invalid secret key'
      });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `${user.name} is now an admin`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update role',
      error: error.message
    });
  }
});

// --- POST /api/auth/forgot-password ---
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If account exists, reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send reset email
    await sendEmail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Reset Your Zalams Password',
      html: `
        <div style="font-family:Arial;max-width:600px;margin:0 auto;
          background:#111;color:#fff;padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="font-size:2rem;letter-spacing:0.12em;color:#fff;margin:0;">
              ZALAM<span style="color:#c9a84c;">S</span>
            </h1>
          </div>
          <h2 style="color:#ffffff;text-transform:uppercase;
            letter-spacing:0.06em;margin-bottom:8px;">
            Reset Your Password
          </h2>
          <p style="color:#888;line-height:1.8;margin-bottom:24px;">
            Hi ${user.name}, we received a request to reset your password.
            Click the button below to set a new password.
            This link expires in 1 hour.
          </p>
          <a href="${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}"
            style="display:inline-block;padding:14px 32px;background:#c9a84c;
            color:#000;font-weight:bold;text-decoration:none;
            text-transform:uppercase;letter-spacing:0.1em;font-size:0.85rem;">
            Reset Password →
          </a>
          <p style="color:#555;font-size:0.78rem;margin-top:24px;line-height:1.6;">
            If you didn't request this, ignore this email.
            Your password will remain unchanged.
          </p>
          <div style="border-top:1px solid #222;padding-top:20px;margin-top:24px;">
            <p style="color:#555;font-size:0.72rem;text-align:center;margin:0;">
              © 2026 Zalams Luxury
            </p>
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Reset link sent successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not send reset email',
      error: error.message
    });
  }
});


// --- POST /api/auth/reset-password ---
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and update password
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password (pre save hook will hash it)
    user.password = password;
    await user.save();

    // Send confirmation email
    sendEmail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Successful — Zalams Luxury',
      html: `
        <div style="font-family:Arial;max-width:600px;margin:0 auto;
          background:#111;color:#fff;padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="font-size:2rem;letter-spacing:0.12em;color:#fff;margin:0;">
              ZALAM<span style="color:#c9a84c;">S</span>
            </h1>
          </div>
          <h2 style="color:#4caf50;text-transform:uppercase;
            letter-spacing:0.06em;margin-bottom:8px;">
            Password Reset Successful!
          </h2>
          <p style="color:#888;line-height:1.8;">
            Hi ${user.name}, your password has been reset successfully.
            You can now log in with your new password.
          </p>
          <a href="${process.env.FRONTEND_URL}/login.html"
            style="display:inline-block;margin-top:24px;padding:14px 32px;
            background:#c9a84c;color:#000;font-weight:bold;
            text-decoration:none;text-transform:uppercase;
            letter-spacing:0.1em;font-size:0.85rem;">
            Log In Now →
          </a>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired reset link',
      error: error.message
    });
  }
});

// --- GET /api/auth/users ---
// Admin only — get all registered users
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requestingUser = await User.findById(decoded.userId);

    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access only'
      });
    }

    const users = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .select('-password');

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not load users',
      error: error.message
    });
  }
});

export default router;