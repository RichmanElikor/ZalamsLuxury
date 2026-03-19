/* ================================
   ZALAMS LUXURY — CART PAGE JS
   cart-page.js
================================ */

function renderCartPage() {
  const layout = document.getElementById('cart-layout');
  const itemCountEl = document.getElementById('cart-item-count');

  if (!layout) return;

  // Update header count
  const totalItems = getCartCount();
  if (itemCountEl) itemCountEl.textContent = totalItems;

  // Empty cart state
  if (cart.length === 0) {
    layout.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <h2 class="cart-empty__title">Your Cart is Empty</h2>
        <p class="cart-empty__text">Looks like you haven't added anything yet.</p>
        <a href="shop.html" class="btn-gold">Start Shopping</a>
      </div>
    `;
    return;
  }

  // Build cart items HTML
  const itemsHTML = `
    <div class="cart-items">

      <div class="cart-items__header">
        <span>Product</span>
        <span>Price</span>
        <span>Quantity</span>
        <span>Remove</span>
      </div>

      <div id="cart-items-list">
        ${cart.map(item => `
          <div class="cart-item" data-id="${item.id}">

            <div class="cart-item__product">
              <img class="cart-item__img"
                src="${item.image}"
                alt="${item.name}" />
              <div class="cart-item__details">
                <p class="cart-item__name">${item.name}</p>
                <p class="cart-item__meta">
                  ₦${item.price.toLocaleString('en-NG')} each
                </p>
              </div>
            </div>

            <div class="cart-item__price">
              ₦${(item.price * item.quantity).toLocaleString('en-NG')}
            </div>

            <div class="cart-item__qty">
              <button class="cart-item__qty-btn"
                onclick="changeQty(${item.id}, -1)">−</button>
              <span class="cart-item__qty-val">${item.quantity}</span>
              <button class="cart-item__qty-btn"
                onclick="changeQty(${item.id}, 1)">+</button>
            </div>

            <button class="cart-item__remove"
              onclick="removeItem(${item.id})"
              title="Remove item">✕</button>

          </div>
        `).join('')}
      </div>

      <div class="cart-items__footer">
        <button class="btn-clear-cart" onclick="clearCart()">
          Clear Entire Cart
        </button>
      </div>

    </div>
  `;

  // Build summary HTML
  const subtotal = getCartTotal();
  const delivery = subtotal >= 50000 ? 0 : 5000;
  const total = subtotal + delivery;

  const summaryHTML = `
    <div class="cart-summary">
      <h2 class="cart-summary__title">Order Summary</h2>

      <div class="cart-summary__row">
        <span class="cart-summary__label">Subtotal</span>
        <span class="cart-summary__value">
          ₦${subtotal.toLocaleString('en-NG')}
        </span>
      </div>

      <div class="cart-summary__row">
        <span class="cart-summary__label">Delivery</span>
        <span class="cart-summary__value ${delivery === 0 ? 'free' : ''}">
          ${delivery === 0 ? 'FREE' : '₦' + delivery.toLocaleString('en-NG')}
        </span>
      </div>

      <div class="cart-summary__divider"></div>

      <div class="cart-summary__row">
        <span class="cart-summary__total-label">Total</span>
        <span class="cart-summary__total-value">
          ₦${total.toLocaleString('en-NG')}
        </span>
      </div>

      <button class="btn-checkout" onclick="proceedToCheckout()">
        Proceed to Checkout
      </button>

      <a href="shop.html" class="btn-continue">
        ← Continue Shopping
      </a>

      <p class="cart-summary__note">
        Free delivery on orders over ₦50,000 ·
        Returns accepted within 7 days
      </p>
    </div>
  `;

  layout.innerHTML = itemsHTML + summaryHTML;
}


// --- Change quantity ---
function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
  }

  renderCartPage();
}


// --- Remove single item ---
function removeItem(productId) {
  removeFromCart(productId);
  renderCartPage();
}


// --- Clear entire cart ---
function clearCart() {
  if (confirm('Are you sure you want to clear your entire cart?')) {
    clearEntireCart();
    renderCartPage();
  }
}


// --- Proceed to checkout ---
function proceedToCheckout() {
  alert('Checkout coming soon! This will connect to Stripe in Phase 3.');
}


// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
});