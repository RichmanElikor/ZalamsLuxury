/* ================================
   ZALAMS LUXURY — PAYMENT ROUTE
   src/routes/payment.js
   (Legacy Stripe - kept for backup)
================================ */

import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Payment route active' });
});

// Legacy verify
router.get('/verify/:sessionId', async (req, res) => {
  try {
    const order = await Order.findOne({
      stripeSessionId: req.params.sessionId
    });
    if (order && order.paymentStatus === 'paid') {
      res.json({ success: true, paid: true, order });
    } else {
      res.json({ success: false, paid: false });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not verify payment',
      error: error.message
    });
  }
});

export default router;