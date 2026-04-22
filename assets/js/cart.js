/* ================================
   ZALAMS LUXURY — CART JS
   cart.js
================================ */

// --- Get cart key based on logged in user ---
function getCartKey() {
  const user = JSON.parse(localStorage.getItem('zalams-user') || 'null');
  return user ? `zalams-cart-${user.id}` : null;
}

// --- Cart State ---
function loadCart() {
  const key = getCartKey();
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

let cart = loadCart();

// --- Save cart to localStorage ---
function saveCart() {
  const key = getCartKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(cart));
  updateCartCount();
}

// --- Update cart count badge in navbar ---
function updateCartCount() {
  const countEls = document.querySelectorAll('#cart-count');
  const key = getCartKey();

  if (!key) {
    // Not logged in — show 0
    countEls.forEach(el => el.textContent = 0);
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  countEls.forEach(el => el.textContent = total || 0);
}

// --- Add item to cart ---
function addToCart(productId, quantity = 1) {
  const user = JSON.parse(localStorage.getItem('zalams-user') || 'null');
  if (!user) {
    // Redirect to login if not logged in
    alert('Please log in to add items to your cart.');
    window.location.href = 'login.html';
    return;
  }

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

// --- Reload cart when user changes ---
function reloadCart() {
  cart = loadCart();
  updateCartCount();
}

// --- Init: update count on page load ---
updateCartCount();