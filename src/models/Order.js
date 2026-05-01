/* ================================
   ZALAMS LUXURY — ORDER MODEL
   src/models/Order.js
================================ */

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  address: {
    street: { type: String },
    city:   { type: String },
    state:  { type: String }
  },
  items: [{
    productId: { type: mongoose.Schema.Types.Mixed },
    name:      { type: String, required: true },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
    size:      { type: String },
    color:     { type: String },
    image:     { type: String }
  }],
  subtotal:         { type: Number, required: true },
  deliveryFee:      { type: Number, default: 0 },
  total:            { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paystack', 'flutterwave', 'pay_on_delivery'],
    default: 'flutterwave'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  stripeSessionId:  { type: String },
  flutterwaveTxRef: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: { type: String },
  notes:          { type: String }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;