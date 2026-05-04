/* ================================
   ZALAMS LUXURY — ACCOUNT PAGE JS
   assets/js/account.js
================================ */

// --- Redirect if not logged in ---
const user = getUser();
const token = getToken();

if (!user || !token) {
  window.location.href = 'login.html';
}

// --- Redirect admin to admin panel ---
if (user && user.role === 'admin') {
  window.location.href = 'admin.html';
}

// --- Populate account header ---
if (user) {
  const nameEl = document.getElementById('account-name');
  const emailEl = document.getElementById('account-email');
  const avatarEl = document.getElementById('account-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}


// --- Tab switching ---
document.querySelectorAll('.account-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.account-tab')
      .forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.account-content')
      .forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    const targetContent = document.getElementById(
      `tab-${tab.dataset.tab}`
    );
    if (targetContent) targetContent.classList.add('active');
  });
});

// Auto open orders tab if #orders in URL
if (window.location.hash === '#orders') {
  const ordersTab = document.querySelector('[data-tab="orders"]');
  if (ordersTab) ordersTab.click();
}


// --- Load Orders ---
async function loadOrders() {
  const ordersList = document.getElementById('orders-list');
  if (!ordersList) return;

  try {
    const response = await fetch(
      `/api/orders/customer/${user.email}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!data.success || data.orders.length === 0) {
      ordersList.innerHTML = `
        <div class="orders-empty">
          <h2 class="orders-empty__title">No Orders Yet</h2>
          <p class="orders-empty__text">
            You haven't placed any orders yet.
          </p>
          <a href="shop.html" class="btn-gold">Start Shopping</a>
        </div>
      `;
      return;
    }

    ordersList.innerHTML = data.orders.map(order => `
      <div class="order-card">
        <div class="order-card__header">
          <div>
            <p class="order-card__id">
              Order <span>#${order._id.slice(-8).toUpperCase()}</span>
            </p>
            <p class="order-card__date">
              ${new Date(order.createdAt).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <span class="order-status ${order.status}">
            ${order.status}
          </span>
        </div>

        <div class="order-card__items">
          ${order.items.map(item => `
            <div class="order-item">
              <img
                class="order-item__img"
                src="${item.image || ''}"
                alt="${item.name}"
                onerror="this.style.display='none'"
              />
              <div class="order-item__details">
                <p class="order-item__name">${item.name}</p>
                <p class="order-item__meta">
                  Qty: ${item.quantity}
                  ${item.size
                    ? `· Size: <strong>${item.size}</strong>`
                    : ''}
                </p>
              </div>
              <p class="order-item__price">
                ₦${(item.price * item.quantity)
                  .toLocaleString('en-NG')}
              </p>
            </div>
          `).join('')}
        </div>

        <div class="order-card__footer">
          <div>
            <span class="order-card__total-label">Payment</span>
            <span class="order-status ${order.paymentStatus}"
              style="margin-left:8px;">
              ${order.paymentStatus}
            </span>
          </div>
          <span class="order-card__total">
            ₦${order.total.toLocaleString('en-NG')}
          </span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Orders error:', error);
    if (ordersList) {
      ordersList.innerHTML = `
        <div class="orders-empty">
          <p class="orders-empty__text">
            Could not load orders. Please try again.
          </p>
        </div>
      `;
    }
  }
}


// --- Load Profile from server ---
async function loadProfile() {
  try {
    const response = await fetch(`/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success && data.user) {
      const u = data.user;

      // Update localStorage with fresh server data
      const updatedUser = {
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone || '',
        address: u.address || {}
      };
      localStorage.setItem('zalams-user', JSON.stringify(updatedUser));

      // Update header
      const nameEl = document.getElementById('account-name');
      const avatarEl = document.getElementById('account-avatar');
      if (nameEl) nameEl.textContent = u.name;
      if (avatarEl) avatarEl.textContent = u.name.charAt(0).toUpperCase();

      // Populate form fields
      const nameInput = document.getElementById('profile-name');
      const phoneInput = document.getElementById('profile-phone');
      const streetInput = document.getElementById('profile-street');
      const cityInput = document.getElementById('profile-city');
      const stateInput = document.getElementById('profile-state');
      const emailInput = document.getElementById('profile-email');

      if (nameInput) nameInput.value = u.name || '';
      if (emailInput) emailInput.value = u.email || '';
      if (phoneInput) phoneInput.value = u.phone || '';
      if (streetInput) streetInput.value = u.address?.street || '';
      if (cityInput) cityInput.value = u.address?.city || '';
      if (stateInput) stateInput.value = u.address?.state || '';
    }

  } catch (error) {
    console.error('Profile error:', error);
  }
}


// --- Save Profile ---
async function saveProfile() {
  const name = document.getElementById('profile-name')?.value.trim();
  const phone = document.getElementById('profile-phone')?.value.trim();
  const street = document.getElementById('profile-street')?.value.trim();
  const city = document.getElementById('profile-city')?.value.trim();
  const state = document.getElementById('profile-state')?.value.trim();
  const successEl = document.getElementById('profile-success');

  try {
    const response = await fetch(`/api/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        phone,
        address: { street, city, state }
      })
    });

    const data = await response.json();

    if (data.success) {
      // Update localStorage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('zalams-user') || '{}'),
        name: data.user.name,
        phone: data.user.phone,
        address: data.user.address
      };
      localStorage.setItem('zalams-user', JSON.stringify(updatedUser));

      if (successEl) {
        successEl.style.color = '#4caf50';
        successEl.textContent = '✓ Profile saved successfully!';
        setTimeout(() => successEl.textContent = '', 3000);
      }

      // Update header name
      const nameEl = document.getElementById('account-name');
      const avatarEl = document.getElementById('account-avatar');
      if (nameEl) nameEl.textContent = data.user.name;
      if (avatarEl) {
        avatarEl.textContent = data.user.name.charAt(0).toUpperCase();
      }

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
// INIT — runs after page loads
// ================================
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  loadProfile();
});