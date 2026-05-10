import express from 'express';
import contactRoutes from './contact.js';
import productRoutes from './products.js';
import orderRoutes from './orders.js';
import paymentRoutes from './payment.js';

const router = express.Router();

// Mount sub-routers
router.use('/contact', contactRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRoutes);




export default router;