/* ================================
   ZALAMS LUXURY — SERVER
   src/server.js
================================ */
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

// Routes
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import contactRouter from './routes/contact.js';
import paymentRouter from './routes/payment.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import flutterwaveRouter from './routes/flutterwave.js';


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

// --- Page Routes (clean URLs) ---
const pages = [
  { route: '/',                file: 'index.html' },
  { route: '/shop',            file: 'shop.html' },
  { route: '/product',         file: 'product.html' },
  { route: '/cart',            file: 'cart.html' },
  { route: '/about',           file: 'about.html' },
  { route: '/contact',         file: 'contact.html' },
  { route: '/faq',             file: 'faq.html' },
  { route: '/login',           file: 'login.html' },
  { route: '/signup',          file: 'signup.html' },
  { route: '/account',         file: 'account.html' },
  { route: '/admin',           file: 'admin.html' },
  { route: '/success',         file: 'success.html' },
  { route: '/forgot-password', file: 'forgot-password.html' },
  { route: '/reset-password',  file: 'reset-password.html' },
  { route: '/admin-order',     file: 'admin-order.html' }
];

pages.forEach(({ route, file }) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '..', file));
  });
});

// --- API Routes ---
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/payment', paymentRouter); 
app.use('/api/auth', authRouter);
app.use('/api/flutterwave', flutterwaveRouter);
app.use('/api/products/upload', uploadRouter);


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
  res.sendFile(path.join(__dirname, '..', '/'));
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