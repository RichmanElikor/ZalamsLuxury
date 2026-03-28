/* ================================
   ZALAMS LUXURY — PRODUCT MODEL
   src/models/Product.js
================================ */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'men-tshirts',
      'men-outerwear',
      'men-shirts',
      'men-pants',
      'men-denim',
      'women-tops',
      'women-gowns',
      'women-skirts',
      'bags',
      'hats',
      'belts'
    ]
  },
  images: [{
    type: String    // Array of image URLs
  }],
  colors: [{
    type: String    // Array of hex colors
  }],
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  }],
  tag: {
    type: String,
    default: 'New In'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true    // Adds createdAt and updatedAt automatically
});

const Product = mongoose.model('Product', productSchema);

export default Product;