import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import {
  sendEmail,
  orderConfirmationEmail,
  newOrderAlertEmail
} from '../config/email.js';

const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'placeholder') {
    throw new Error('STRIPE_SECRET_KEY is missing');
  }
  return new Stripe(key);
}


// --- POST /api/payment/create-checkout ---
router.post('/create-checkout', async (req, res) => {
  try {
    const stripe = getStripe();

    const {
      customerName,
      email,
      phone,
      address,
      items,
      subtotal,
      deliveryFee,
      total
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in cart'
      });
    }

    const isProd = process.env.NODE_ENV === 'production';

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'ngn',
        product_data: {
          name: item.name,
          ...(isProd && item.image ? { images: [item.image] } : {})
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));

    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'ngn',
          product_data: { name: 'Delivery Fee' },
          unit_amount: Math.round(deliveryFee * 100)
        },
        quantity: 1
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      success_url: `${frontendUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cart.html`,
      metadata: {
        customerName,
        phone,
        address: JSON.stringify(address)
      }
    });

    // Save order to DB
    const order = await Order.create({
      customerName,
      email,
      phone,
      address,
      items,
      subtotal,
      deliveryFee: deliveryFee || 0,
      total,
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
      stripeSessionId: session.id
    });

    // Send emails
    sendEmail(orderConfirmationEmail(order));
    sendEmail(newOrderAlertEmail(order));

    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order._id
    });

  } catch (error) {
    console.error('❌ Checkout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not create checkout session',
      error: error.message
    });
  }
});


// --- POST /api/payment/webhook ---
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      await Order.findOneAndUpdate(
        { stripeSessionId: session.id },
        { paymentStatus: 'paid', status: 'processing' }
      );
      console.log(`✅ Payment confirmed: ${session.id}`);
    } catch (error) {
      console.error('Error updating order:', error.message);
    }
  }

  res.json({ received: true });
});


// --- GET /api/payment/verify/:sessionId ---
router.get('/verify/:sessionId', async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );

    if (session.payment_status === 'paid') {
      const order = await Order.findOne({
        stripeSessionId: req.params.sessionId
      });
      res.json({ success: true, paid: true, order });
    } else {
      res.json({
        success: false,
        paid: false,
        message: 'Payment not completed'
      });
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