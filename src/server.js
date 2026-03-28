/* ================================
   ZALAMS LUXURY — SERVER
   src/server.js
================================ */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

// Routes
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import contactRouter from './routes/contact.js';
import paymentRouter from './routes/payment.js';

// --- Setup ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Connect to MongoDB ---
connectDB();

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Webhook needs raw body so it must come BEFORE express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve Frontend ---
app.use(express.static(path.join(__dirname, '..')));

// --- API Routes ---
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/payment', paymentRouter);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Zalams Luxury server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// --- Fallback: serve index.html ---
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ================================
  🚀 Zalams Luxury Server Running
  ================================
  Local:   http://localhost:${PORT}
  Health:  http://localhost:${PORT}/api/health
  Mode:    ${process.env.NODE_ENV}
  ================================
  `);
});