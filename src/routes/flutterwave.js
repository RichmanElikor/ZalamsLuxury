/* ================================
   ZALAMS LUXURY — FLUTTERWAVE
   src/routes/flutterwave.js
================================ */

import express from 'express';
import Order from '../models/Order.js';
import {
  sendEmail,
  orderConfirmationEmail,
  newOrderAlertEmail
} from '../config/email.js';

const router = express.Router();
// --- GET /api/flutterwave/config ---
router.get('/config', (req, res) => {
  res.json({
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY
  });
});


// --- POST /api/flutterwave/create-payment ---
router.post('/create-payment', async (req, res) => {
  try {
    const {
      customerName, email, phone, address,
      items, subtotal, deliveryFee, total
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in cart'
      });
    }

    const order = await Order.create({
      customerName,
      email,
      phone: phone || '08000000000',
      address: address || { street: 'TBD', city: 'TBD', state: 'TBD' },
      items,
      subtotal,
      deliveryFee: deliveryFee || 0,
      total,
      paymentMethod: 'flutterwave',
      paymentStatus: 'pending'
    });

    const txRef = `ZALAMS-${order._id}-${Date.now()}`;
    order.flutterwaveTxRef = txRef;
    await order.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const payload = {
      tx_ref: txRef,
      amount: total,
      currency: 'NGN',
      redirect_url: `${frontendUrl}/success.html`,
      customer: {
        email,
        phonenumber: phone || '08000000000',
        name: customerName
      },
      meta: { orderId: order._id.toString() },
      customizations: {
        title: 'Zalams Luxury',
        description: `Order #${order._id.toString().slice(-8).toUpperCase()}`,
        logo: `${frontendUrl}/assets/images/logo/zalams-logo.png`
      },
      payment_options: 'card,banktransfer,ussd'
    };
    console.log(
      'Secret key prefix:',
      process.env.FLUTTERWAVE_SECRET_KEY?.slice(0, 10)
    );
    const flwResponse = await fetch(
      'https://api.flutterwave.com/v3/payments',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const rawResponse = await flwResponse.text();

    console.log('Flutterwave status:', flwResponse.status);
    console.log('Flutterwave raw response:', rawResponse);

    if (data.status === 'success') {
      res.json({
        success: true,
        paymentLink: data.data.link,
        orderId: order._id,
        txRef
      });
    } else {
      res.status(400).json({
        success: false,
        message: data.message || 'Could not initialize payment'
      });
    }

  } catch (error) {
    console.error('❌ Flutterwave error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.message
    });
  }
});


// --- GET /api/flutterwave/verify ---
router.get('/verify', async (req, res) => {
  try {
    const { tx_ref, status, transaction_id } = req.query;

    if (status === 'cancelled') {
      return res.json({
        success: false,
        paid: false,
        message: 'Payment cancelled'
      });
    }

    if (!tx_ref) {
      return res.json({
        success: false,
        paid: false,
        message: 'Missing transaction reference'
      });
    }

    // If no transaction_id, find order by txRef and check status
    if (!transaction_id) {
      const order = await Order.findOne({ flutterwaveTxRef: tx_ref });
      if (order && order.paymentStatus === 'paid') {
        return res.json({ success: true, paid: true, order });
      }
      return res.json({
        success: false,
        paid: false,
        message: 'Payment pending verification'
      });
    }

    // Verify with Flutterwave API
    const flwResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    const data = await flwResponse.json();

    if (data.data?.status === 'successful') {
      const order = await Order.findOneAndUpdate(
        { flutterwaveTxRef: tx_ref },
        { paymentStatus: 'paid', status: 'processing' },
        { new: true }
      );

      if (order) {
        sendEmail(orderConfirmationEmail(order));
        sendEmail(newOrderAlertEmail(order));
      }

      res.json({ success: true, paid: true, order });
    } else {
      res.json({
        success: false,
        paid: false,
        message: 'Payment not successful'
      });
    }

  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
});


// --- POST /api/flutterwave/webhook ---
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (secretHash && signature !== secretHash) {
      return res.status(401).send('Unauthorized');
    }

    try {
      const payload = JSON.parse(req.body.toString());

      if (payload.event === 'charge.completed' &&
          payload.data.status === 'successful') {
        const txRef = payload.data.tx_ref;

        const order = await Order.findOneAndUpdate(
          { flutterwaveTxRef: txRef },
          { paymentStatus: 'paid', status: 'processing' },
          { new: true }
        );

        if (order) {
          sendEmail(orderConfirmationEmail(order));
          sendEmail(newOrderAlertEmail(order));
          console.log(`✅ Webhook payment confirmed: ${txRef}`);
        }
      }
    } catch (error) {
      console.error('Webhook error:', error.message);
    }

    res.sendStatus(200);
  }
);

// --- POST /api/flutterwave/confirm ---
router.post('/confirm', async (req, res) => {
  try {
    const { orderId, txRef, transactionId } = req.body;

    // Verify with Flutterwave
    const flwResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    const data = await flwResponse.json();

    if (data.data?.status === 'successful') {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          status: 'processing',
          flutterwaveTxRef: txRef
        },
        { new: true }
      );

      if (order) {
        sendEmail(orderConfirmationEmail(order));
        sendEmail(newOrderAlertEmail(order));
        console.log(`✅ Payment confirmed: ${txRef}`);
      }

      res.json({ success: true, order });
    } else {
      res.json({ success: false, message: 'Payment not verified' });
    }

  } catch (error) {
    console.error('Confirm error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not confirm payment',
      error: error.message
    });
  }
});

export default router;
