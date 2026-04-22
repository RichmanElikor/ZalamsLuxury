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

// Redirect admin to admin panel
if (user && user.role === 'admin') {
  window.location.href = 'admin.html';
}

// --- Populate account header ---
if (user) {
  document.getElementById('account-name').textContent = user.name;
  document.getElementById('account-email').textContent = user.email;
  document.getElementById('account-avatar').textContent =
    user.name.charAt(0).toUpperCase();
  document.getElementById('profile-name').value = user.name;
  document.getElementById('profile-email').value = user.email;
}


// --- Tab switching ---
document.querySelectorAll('.account-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.account-tab')
      .forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.account-content')
      .forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`)
      .classList.add('active');
  });
});

// Auto open orders tab if #orders in URL
if (window.location.hash === '#orders') {
  document.querySelector('[data-tab="orders"]').click();
}


// --- Load Orders ---
async function loadOrders() {
  const ordersList = document.getElementById('orders-list');

  try {
    const response = await fetch(
      `${API}/orders/customer/${user.email}`,
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
              />
              <div class="order-item__details">
                <p class="order-item__name">${item.name}</p>
                <p class="order-item__meta">
                  Qty: ${item.quantity}
                  ${item.size ? `· Size: ${item.size}` : ''}
                </p>
              </div>
              <p class="order-item__price">
                ₦${(item.price * item.quantity).toLocaleString('en-NG')}
              </p>
            </div>
          `).join('')}
        </div>

        <div class="order-card__footer">
          <span class="order-card__total-label">Total</span>
          <span class="order-card__total">
            ₦${order.total.toLocaleString('en-NG')}
          </span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    ordersList.innerHTML = `
      <div class="orders-empty">
        <p class="orders-empty__text">Could not load orders. Please try again.</p>
      </div>
    `;
  }
}


// --- Save Profile ---
async function saveProfile() {
  const name = document.getElementById('profile-name').value.trim();
  const street = document.getElementById('profile-street').value.trim();
  const city = document.getElementById('profile-city').value.trim();
  const state = document.getElementById('profile-state').value.trim();
  const phone = document.getElementById('profile-phone').value.trim();
  const successEl = document.getElementById('profile-success');

  try {
    const response = await fetch(`${API}/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        address: { street, city, state, phone }
      })
    });

    const data = await response.json();

    if (data.success) {
      // Update localStorage with new name
      const updatedUser = { ...user, name };
      localStorage.setItem('zalams-user', JSON.stringify(updatedUser));
      successEl.textContent = '✓ Profile updated successfully!';
      setTimeout(() => successEl.textContent = '', 3000);
    }

  } catch (error) {
    successEl.style.color = '#ff4444';
    successEl.textContent = 'Could not save profile. Try again.';
  }
}


// --- Init ---
loadOrders();