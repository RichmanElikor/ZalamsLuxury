/* ================================
   ZALAMS LUXURY — PRODUCTS ROUTE
   src/routes/products.js
================================ */

import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();


// --- GET /api/products ---
// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, inStock, featured } = req.query;

    // Build filter object dynamically
    const filter = {};
    if (category) filter.category = category;
    if (inStock)  filter.inStock = inStock === 'true';
    if (featured) filter.featured = featured === 'true';

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not load products',
      error: error.message
    });
  }
});


// --- GET /api/products/:id ---
// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not load product',
      error: error.message
    });
  }
});


// --- POST /api/products ---
// Create a new product (admin only later)
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Could not create product',
      error: error.message
    });
  }
});


// --- PUT /api/products/:id ---
// Update a product (admin only later)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Could not update product',
      error: error.message
    });
  }
});


// --- DELETE /api/products/:id ---
// Delete a product (admin only later)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not delete product',
      error: error.message
    });
  }
});


export default router;