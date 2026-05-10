/* ================================
   ZALAMS LUXURY — ACCOUNT PAGE JS
   assets/js/account.js
================================ */

const user = getUser();
const token = getToken();

if (!user || !token) {
  window.location.href = '/login';
}

if (user && user.role === 'admin') {
  window.location.href = '/admin';
}

if (user) {
  const nameEl = document.getElementById('account-name');
  const emailEl = document.getElementById('account-email');
  const avatarEl = document.getElementById('account-avatar');
  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}

document.querySelectorAll('.account-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.account-tab')
      .forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.account-content')
      .forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const targetContent = document.getElementById('tab-' + tab.dataset.tab);
    if (targetContent) targetContent.classList.add('active');
  });
});

if (window.location.hash === '#orders') {
  const ordersTab = document.querySelector('[data-tab="orders"]');
  if (ordersTab) ordersTab.click();
}


// --- Retry Payment ---
async function retryPayment(orderId, total, email, customerName) {
  const btn = event.target;
  btn.textContent = 'Loading...';
  btn.disabled = true;

  try {
    const publicKeyRes = await fetch('/api/flutterwave/config');
    const { publicKey } = await publicKeyRes.json();

    const txRef = 'ZALAMS-RETRY-' + orderId + '-' + Date.now();

    FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: txRef,
      amount: total,
      currency: 'NGN',
      payment_options: 'card, banktransfer, ussd',
      customer: {
        email: email,
        name: customerName
      },
      customizations: {
        title: 'Zalams Luxury',
        description: 'Complete your order payment',
        logo: ''
      },
      callback: async function(response) {
        if (response.status === 'successful') {
          try {
            await fetch('/api/flutterwave/mark-paid', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderId,
                txRef: txRef,
                transactionId: response.transaction_id
              })
            });
          } catch (e) {
            console.error('Mark paid error:', e);
          }
          loadOrders();
        }
      },
      onclose: function() {
        btn.textContent = 'Complete Payment';
        btn.disabled = false;
      }
    });

  } catch (error) {
    console.error('Retry payment error:', error);
    btn.textContent = 'Complete Payment';
    btn.disabled = false;
  }
}


// --- Load Orders ---
async function loadOrders() {
  const ordersList = document.getElementById('orders-list');
  if (!ordersList) return;

  try {
    const response = await fetch(
      '/api/orders/customer/' + user.email,
      { headers: { 'Authorization': 'Bearer ' + token } }
    );

    const data = await response.json();

    if (!data.success || data.orders.length === 0) {
      ordersList.innerHTML = '<div class="orders-empty"><h2 class="orders-empty__title">No Orders Yet</h2><p class="orders-empty__text">You haven\'t placed any orders yet.</p><a href="/shop" class="btn-gold">Start Shopping</a></div>';
      return;
    }

    let html = '';

    data.orders.forEach(function(order) {
      const date = new Date(order.createdAt).toLocaleDateString('en-NG', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      let itemsHtml = '';
      order.items.forEach(function(item) {
        itemsHtml += '<div class="order-item">';
        itemsHtml += '<img class="order-item__img" src="' + (item.image || '') + '" alt="' + item.name + '" onerror="this.style.display=\'none\'" />';
        itemsHtml += '<div class="order-item__details">';
        itemsHtml += '<p class="order-item__name">' + item.name + '</p>';
        itemsHtml += '<p class="order-item__meta">Qty: ' + item.quantity;
        if (item.size) itemsHtml += ' · Size: <strong>' + item.size + '</strong>';
        itemsHtml += '</p></div>';
        itemsHtml += '<p class="order-item__price">₦' + (item.price * item.quantity).toLocaleString('en-NG') + '</p>';
        itemsHtml += '</div>';
      });

      html += '<div class="order-card">';

      // Header
      html += '<div class="order-card__header">';
      html += '<div>';
      html += '<p class="order-card__id">Order <span>#' + order._id.slice(-8).toUpperCase() + '</span></p>';
      html += '<p class="order-card__date">' + date + '</p>';
      html += '</div>';
      html += '<span class="order-status ' + order.status + '">' + order.status + '</span>';
      html += '</div>';

      // Items
      html += '<div class="order-card__items">' + itemsHtml + '</div>';

      // Footer
      html += '<div class="order-card__footer">';
      html += '<div style="display:flex;align-items:center;gap:12px;">';
      html += '<span class="order-card__total-label">Payment</span>';
      html += '<span class="order-status ' + order.paymentStatus + '" style="margin-left:4px;">' + order.paymentStatus + '</span>';

      // Complete Payment button for pending orders
      if (order.paymentStatus === 'pending') {
        html += '<button onclick="retryPayment(\'' + order._id + '\', ' + order.total + ', \'' + order.email + '\', \'' + order.customerName + '\')" style="padding:6px 14px;background:var(--color-gold);border:none;color:#000;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;font-family:var(--font-body);border-radius:2px;">Complete Payment</button>';
      }

      html += '</div>';
      html += '<span class="order-card__total">₦' + order.total.toLocaleString('en-NG') + '</span>';
      html += '</div>';

      html += '</div>';
    });

    ordersList.innerHTML = html;

  } catch (error) {
    console.error('Orders error:', error);
    if (ordersList) {
      ordersList.innerHTML = '<div class="orders-empty"><p class="orders-empty__text">Could not load orders. Please try again.</p></div>';
    }
  }
}


// --- Load Profile ---
async function loadProfile() {
  try {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await response.json();

    if (data.success && data.user) {
      const u = data.user;

      const updatedUser = {
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone || '',
        address: u.address || {}
      };
      localStorage.setItem('zalams-user', JSON.stringify(updatedUser));

      const nameEl = document.getElementById('account-name');
      const avatarEl = document.getElementById('account-avatar');
      if (nameEl) nameEl.textContent = u.name;
      if (avatarEl) avatarEl.textContent = u.name.charAt(0).toUpperCase();

      const nameInput = document.getElementById('profile-name');
      const emailInput = document.getElementById('profile-email');
      const phoneInput = document.getElementById('profile-phone');
      const streetInput = document.getElementById('profile-street');
      const cityInput = document.getElementById('profile-city');
      const stateInput = document.getElementById('profile-state');

      if (nameInput) nameInput.value = u.name || '';
      if (emailInput) emailInput.value = u.email || '';
      if (phoneInput) phoneInput.value = u.phone || '';
      if (streetInput) streetInput.value = u.address && u.address.street ? u.address.street : '';
      if (cityInput) cityInput.value = u.address && u.address.city ? u.address.city : '';
      if (stateInput) stateInput.value = u.address && u.address.state ? u.address.state : '';
    }
  } catch (error) {
    console.error('Profile error:', error);
  }
}


// --- Save Profile ---
async function saveProfile() {
  const name = document.getElementById('profile-name') ? document.getElementById('profile-name').value.trim() : '';
  const phone = document.getElementById('profile-phone') ? document.getElementById('profile-phone').value.trim() : '';
  const street = document.getElementById('profile-street') ? document.getElementById('profile-street').value.trim() : '';
  const city = document.getElementById('profile-city') ? document.getElementById('profile-city').value.trim() : '';
  const state = document.getElementById('profile-state') ? document.getElementById('profile-state').value.trim() : '';
  const successEl = document.getElementById('profile-success');

  try {
    const response = await fetch('/api/auth/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        name: name,
        phone: phone,
        address: { street: street, city: city, state: state }
      })
    });

    const data = await response.json();

    if (data.success) {
      const existing = JSON.parse(localStorage.getItem('zalams-user') || '{}');
      const updatedUser = Object.assign({}, existing, {
        name: data.user.name,
        phone: data.user.phone,
        address: data.user.address
      });
      localStorage.setItem('zalams-user', JSON.stringify(updatedUser));

      if (successEl) {
        successEl.style.color = '#4caf50';
        successEl.textContent = '✓ Profile saved successfully!';
        setTimeout(function() { successEl.textContent = ''; }, 3000);
      }

      const nameEl = document.getElementById('account-name');
      const avatarEl = document.getElementById('account-avatar');
      if (nameEl) nameEl.textContent = data.user.name;
      if (avatarEl) avatarEl.textContent = data.user.name.charAt(0).toUpperCase();

    } else {
      if (successEl) {
        successEl.style.color = '#ff4444';
        successEl.textContent = data.message || 'Could not save.';
      }
    }
  } catch (error) {
    if (successEl) {
      successEl.style.color = '#ff4444';
      successEl.textContent = 'Something went wrong. Try again.';
    }
  }
}


// ================================
// INIT
// ================================
document.addEventListener('DOMContentLoaded', function() {
  loadOrders();
  loadProfile();
});