/* ================================
   ZALAMS LUXURY — CART JS
   cart.js
================================ */

// --- Cart State ---
let cart = JSON.parse(localStorage.getItem('zalams-cart')) || [];

// --- Save cart to localStorage ---
function saveCart() {
  localStorage.setItem('zalams-cart', JSON.stringify(cart));
  updateCartCount();
}

// --- Update cart count badge in navbar ---
function updateCartCount() {
  const countEls = document.querySelectorAll('#cart-count');
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  countEls.forEach(el => el.textContent = total);
}

// --- Add item to cart ---
function addToCart(productId, quantity = 1) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }

  saveCart();
}

// --- Remove item from cart ---
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
}

// --- Update quantity ---
function updateCartQuantity(productId, quantity) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) removeFromCart(productId);
    else saveCart();
  }
}

// --- Clear entire cart ---
function clearEntireCart() {
  cart = [];
  saveCart();
}

// --- Get cart total ---
function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// --- Get cart count ---
function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// --- Init: update count on page load ---
updateCartCount();