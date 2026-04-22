/* ================================
   ZALAMS LUXURY — CONTACT ROUTE
   src/routes/contact.js
================================ */

import express from 'express';
import Message from '../models/Message.js';
import { sendEmail, contactFormEmail } from '../config/email.js';

const router = express.Router();


// --- POST /api/contact ---
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'First name, email and message are required'
      });
    }

    const newMessage = await Message.create({
      firstName,
      lastName,
      email,
      subject,
      message
    });

    // Send notification email to admin
    sendEmail(contactFormEmail(newMessage));

    res.status(201).json({
      success: true,
      message: 'Message received! We will get back to you within 24 hours.',
      data: newMessage
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Could not send message',
      error: error.message
    });
  }
});


// --- GET /api/contact ---
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: messages.length,
      messages
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not load messages',
      error: error.message
    });
  }
});


export default router;