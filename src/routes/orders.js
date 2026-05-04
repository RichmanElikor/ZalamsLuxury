/* ================================
   ZALAMS LUXURY — ORDERS ROUTE
   src/routes/orders.js
================================ */

import express from 'express';
import Order from '../models/Order.js';
import {
  sendEmail,
  orderShippedEmail,
  orderDeliveredEmail
} from '../config/email.js';


const router = express.Router();


// --- POST /api/orders ---
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod
    } = req.body;

    if (!customerName || !email || !phone || !address || !items || !total) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const order = await Order.create({
      customerName,
      email,
      phone,
      address,
      items,
      subtotal,
      deliveryFee: deliveryFee || 0,
      total,
      paymentMethod: paymentMethod || 'stripe'
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Could not create order',
      error: error.message
    });
  }
});


// --- GET /api/orders ---
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not load orders',
      error: error.message
    });
  }
});


// --- GET /api/orders/customer/:email ---
// MUST be before /:id
router.get('/customer/:email', async (req, res) => {
  try {
    const orders = await Order.find({
      email: req.params.email
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not load orders',
      error: error.message
    });
  }
});


// --- GET /api/orders/:id ---
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not load order',
      error: error.message
    });
  }
});


// --- PATCH /api/orders/:id/status ---
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Send shipped email to customer
    if (status === 'shipped') {
      sendEmail(orderShippedEmail(order));
    }

    // Send delivered appreciation email
    if (status === 'delivered') {
      sendEmail(orderDeliveredEmail(order));
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Could not update order status',
      error: error.message
    });
  }
});


export default router;