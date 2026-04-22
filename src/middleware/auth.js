/* ================================
   ZALAMS LUXURY — AUTH MIDDLEWARE
   src/middleware/auth.js
================================ */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';


// --- Protect Route Middleware ---
// Add this to any route that requires login
export const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Header format: "Bearer eyJhbGci..."
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access this'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Attach user to request object
    req.user = user;
    next();                   // Move to the actual route handler

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};


// --- Admin Only Middleware ---
// Add this after protect for admin-only routes
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins only.'
    });
  }
  next();
};