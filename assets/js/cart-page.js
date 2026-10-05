/* ================================
   ZALAMS LUXURY — CART PAGE JS
   cart-page.js
================================ */

function renderCartPage() {
  const layout = document.getElementById('cart-layout');
  const itemCountEl = document.getElementById('cart-item-count');

  if (!layout) return;

  const totalItems = getCartCount();
  if (itemCountEl) itemCountEl.textContent = totalItems;

  if (cart.length === 0) {
    layout.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <h2 class="cart-empty__title">Your Cart is Empty</h2>
        <p class="cart-empty__text">
          Looks like you haven't added anything yet.
        </p>
        <a href="/shop" class="btn-gold">Start Shopping</a>
      </div>
    `;
    return;
  }

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
                src="${item.image}" alt="${item.name}" />
              <div class="cart-item__details">
                <p class="cart-item__name"
                  style="cursor:pointer;text-decoration:underline;"
                  onclick="window.location.href='/product?id=${item.id}'">
                  ${item.name}
                </p>
                <p class="cart-item__meta">
                  ₦${item.price.toLocaleString('en-NG')} each
                  ${item.size ? `· Size: <strong>${item.size}</strong>` : ''}
                  ${item.color ? `· ${item.color}` : ''}
                </p>
              </div>
            </div>
            <div class="cart-item__price">
              ₦${(item.price * item.quantity).toLocaleString('en-NG')}
            </div>
            <div class="cart-item__qty">
              <button class="cart-item__qty-btn"
                data-action="minus" data-id="${item.id}">−</button>
              <span class="cart-item__qty-val">${item.quantity}</span>
              <button class="cart-item__qty-btn"
                data-action="plus" data-id="${item.id}">+</button>
            </div>
            <button class="cart-item__remove"
              data-action="remove" data-id="${item.id}">✕</button>
          </div>
        `).join('')}
      </div>
      <div class="cart-items__footer">
        <button class="btn-clear-cart" id="clear-cart-btn">
          Clear Entire Cart
        </button>
      </div>
    </div>
  `;

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
      <button class="btn-checkout" id="checkout-btn">
        Proceed to Checkout
      </button>
      <a href="/shop" class="btn-continue">
        ← Continue Shopping
      </a>
      <p class="cart-summary__note">
        Free delivery on orders over ₦50,000 ·
        Returns accepted within 7 days
      </p>
    </div>
  `;

  layout.innerHTML = itemsHTML + summaryHTML;

  // Attach events AFTER rendering
  attachCartEvents();
}


function attachCartEvents() {
  // Quantity and remove buttons
  document.querySelectorAll('.cart-item__qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const item = cart.find(i => i.id === id);
      if (!item) return;

      if (action === 'plus') {
        item.quantity++;
        saveCart();
      } else if (action === 'minus') {
        item.quantity--;
        if (item.quantity <= 0) {
          removeFromCart(id);
        } else {
          saveCart();
        }
      }
      renderCartPage();
    });
  });

  // Remove buttons
  document.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id);
      renderCartPage();
    });
  });

  // Clear cart
  const clearBtn = document.getElementById('clear-cart-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear entire cart?')) {
        clearEntireCart();
        renderCartPage();
      }
    });
  }

  // Checkout
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
  }
}

async function getFlwPublicKey() {
  try {
    const res = await fetch('/api/flutterwave/config');
    const data = await res.json();
    return data.publicKey;
  } catch {
    return null;
  }
}

async function proceedToCheckout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const user = getUser();
  if (!user) {
    alert('Please log in to checkout.');
    window.location.href = '/login';
    return;
  }

  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= 50000 ? 0 : 5000;
  const total = subtotal + deliveryFee;

  const btn = document.getElementById('checkout-btn');
  if (btn) {
    btn.textContent = 'Processing...';
    btn.disabled = true;
  }

  try {
    // First save order to our backend
    const orderResponse = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: user.name,
        email: user.email,
        phone: user.phone || '08000000000',
        address: { street: 'TBD', city: 'TBD', state: 'TBD' },
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size || '',
          color: item.color || ''
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod: 'flutterwave'
      })
    });

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      alert('Could not create order. Please try again.');
      if (btn) {
        btn.textContent = 'Proceed to Checkout';
        btn.disabled = false;
      }
      return;
    }

    const order = orderData.order;
    const txRef = `ZALAMS-${order._id}-${Date.now()}`;
    const publicKey = await getFlwPublicKey();
    if (!publicKey) {
      alert('Payment system unavailable. Please try again.');
      if (btn) { btn.textContent = 'Proceed to Checkout'; btn.disabled = false; }
      return;
}
    // Initialize Flutterwave inline payment
    FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: txRef,
      amount: total,
      currency: 'NGN',
      payment_options: 'card, banktransfer, ussd',
      customer: {
        email: user.email,
        phone_number: user.phone || '08000000000',
        name: user.name
      },
      customizations: {
        title: 'Zalams Luxury',
        description: `Order #${order._id.slice(-8).toUpperCase()}`,
        logo: ''  // Remove logo - leave empty
      },
      callback: async function(response) {
        if (response.status === 'successful') {
          // Verify payment on backend
          try {
            await fetch('/api/flutterwave/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order._id,
                txRef,
                transactionId: response.transaction_id
              })
            });
          } catch (e) {
            console.error('Confirm error:', e);
          }

          clearEntireCart();
          window.location.href =
            `/success.html?order_id=${order._id}`;
        } else {
          alert('Payment was not successful. Please try again.');
          if (btn) {
            btn.textContent = 'Proceed to Checkout';
            btn.disabled = false;
          }
        }
      },
      onclose: function() {
        if (btn) {
          btn.textContent = 'Proceed to Checkout';
          btn.disabled = false;
        }
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    alert('Something went wrong. Please try again.');
    if (btn) {
      btn.textContent = 'Proceed to Checkout';
      btn.disabled = false;
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
});