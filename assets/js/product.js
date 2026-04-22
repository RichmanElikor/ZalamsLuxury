/* ================================
   ZALAMS LUXURY — PRODUCT PAGE JS
   assets/js/product.js
================================ */

// --- Size selector ---
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sizeEl = document.getElementById('selected-size');
    if (sizeEl) sizeEl.textContent = btn.dataset.size;
  });
});


// --- Quantity selector ---
let quantity = 1;
const qtyValue = document.getElementById('qty-value');

const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');

if (qtyMinus) {
  qtyMinus.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      if (qtyValue) qtyValue.textContent = quantity;
    }
  });
}

if (qtyPlus) {
  qtyPlus.addEventListener('click', () => {
    if (quantity < 10) {
      quantity++;
      if (qtyValue) qtyValue.textContent = quantity;
    }
  });
}


// --- Accordion ---
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion-item')
      .forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});


// --- Add to Cart ---
const addCartBtn = document.getElementById('btn-add-cart');
if (addCartBtn) {
  addCartBtn.addEventListener('click', () => {
    const sizeEl = document.getElementById('selected-size');
    const size = sizeEl?.textContent;

    if (size === 'Select a size') {
      alert('Please select a size first.');
      return;
    }

    const productId = new URLSearchParams(window.location.search).get('id');
    addToCart(productId, quantity);

    addCartBtn.textContent = '✓ Added to Cart';
    addCartBtn.style.backgroundColor = 'var(--color-gold)';
    addCartBtn.style.color = '#000';

    setTimeout(() => {
      addCartBtn.textContent = 'Add to Cart';
      addCartBtn.style.backgroundColor = '';
      addCartBtn.style.color = '';
    }, 2000);
  });
}


// --- Buy Now ---
const buyNowBtn = document.getElementById('btn-buy-now');
if (buyNowBtn) {
  buyNowBtn.addEventListener('click', () => {
    const sizeEl = document.getElementById('selected-size');
    const size = sizeEl?.textContent;

    if (size === 'Select a size') {
      alert('Please select a size first.');
      return;
    }

    const productId = new URLSearchParams(window.location.search).get('id');
    addToCart(productId, quantity);
    window.location.href = 'cart.html';
  });
}