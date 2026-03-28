/* ================================
   ZALAMS LUXURY — MESSAGE MODEL
   src/models/Message.js
================================ */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    enum: ['order', 'returns', 'product', 'wholesale', 'other'],
    default: 'other'
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  read: {
    type: Boolean,
    default: false     // For admin panel later
  }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

export default Message;