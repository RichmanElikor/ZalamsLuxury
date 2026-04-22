/* ================================
   ZALAMS LUXURY — ADMIN JS
   assets/js/admin.js
================================ */

const ADMIN_API = 'http://localhost:3000/api';
const adminToken = localStorage.getItem('zalams-token');
const adminUser = JSON.parse(localStorage.getItem('zalams-user') || '{}');

// --- Redirect if not admin ---
if (!adminToken || !adminUser || adminUser.role !== 'admin') {
  window.location.href = 'login.html';
}

// --- Set admin name ---
document.getElementById('admin-user-name').textContent =
  adminUser.name || 'Admin';

// --- Set current date ---
document.getElementById('current-date').textContent =
  new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });


// --- Auth headers ---
const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${adminToken}`
};


// ================================
// TAB NAVIGATION
// ================================
function switchTab(tabName) {
  document.querySelectorAll('.admin-tab')
    .forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-nav__item')
    .forEach(n => n.classList.remove('active'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  document.getElementById('page-title').textContent =
    tabName.charAt(0).toUpperCase() + tabName.slice(1);
}

document.querySelectorAll('.admin-nav__item').forEach(item => {
  item.addEventListener('click', () => {
    switchTab(item.dataset.tab);
  });
});


// ================================
// DASHBOARD STATS
// ================================
async function loadDashboard() {
  try {
    const [ordersRes, productsRes, messagesRes] = await Promise.all([
      fetch(`${ADMIN_API}/orders`, { headers: authHeaders }),
      fetch(`${ADMIN_API}/products`, { headers: authHeaders }),
      fetch(`${ADMIN_API}/contact`, { headers: authHeaders })
    ]);

    const ordersData = await ordersRes.json();
    const productsData = await productsRes.json();
    const messagesData = await messagesRes.json();

    // Stats
    const orders = ordersData.orders || [];
    const products = productsData.products || [];
    const messages = messagesData.messages || [];

    const revenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);

    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-revenue').textContent =
      '₦' + revenue.toLocaleString('en-NG');
    document.getElementById('stat-products').textContent = products.length;
    document.getElementById('stat-messages').textContent =
      messages.filter(m => !m.read).length;

    // Recent orders (last 5)
    const recentOrders = orders.slice(0, 5);
    renderRecentOrders(recentOrders);

  } catch (error) {
    console.error('Dashboard error:', error);
  }
}

function renderRecentOrders(orders) {
  const container = document.getElementById('recent-orders-list');

  if (orders.length === 0) {
    container.innerHTML = '<p class="admin-empty">No orders yet</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td style="color:#c9a84c">
              #${order._id.slice(-8).toUpperCase()}
            </td>
            <td>${order.customerName}<br/>
              <span style="font-size:0.7rem;color:#888">
                ${order.email}
              </span>
            </td>
            <td>₦${order.total.toLocaleString('en-NG')}</td>
            <td>
              <span class="order-status ${order.paymentStatus}">
                ${order.paymentStatus}
              </span>
            </td>
            <td>
              <span class="order-status ${order.status}">
                ${order.status}
              </span>
            </td>
            <td>${new Date(order.createdAt).toLocaleDateString('en-NG')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}


// ================================
// ORDERS
// ================================
let allOrders = [];

async function loadOrders() {
  try {
    const response = await fetch(`${ADMIN_API}/orders`, {
      headers: authHeaders
    });
    const data = await response.json();
    allOrders = data.orders || [];
    renderOrders(allOrders);
  } catch (error) {
    document.getElementById('all-orders-list').innerHTML =
      '<p class="admin-empty">Could not load orders</p>';
  }
}

function filterOrders() {
  const filter = document.getElementById('order-filter').value;
  const filtered = filter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === filter);
  renderOrders(filtered);
}

function renderOrders(orders) {
  const container = document.getElementById('all-orders-list');

  if (orders.length === 0) {
    container.innerHTML = '<p class="admin-empty">No orders found</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Items</th>
          <th>Total</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Update Status</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td style="color:#c9a84c">
              #${order._id.slice(-8).toUpperCase()}
            </td>
            <td>
              ${order.customerName}<br/>
              <span style="font-size:0.7rem;color:#888">
                ${order.email}
              </span><br/>
              <span style="font-size:0.7rem;color:#888">
                ${order.phone || ''}
              </span>
            </td>
            <td>${order.items.length} item(s)</td>
            <td>₦${order.total.toLocaleString('en-NG')}</td>
            <td>
              <span class="order-status ${order.paymentStatus}">
                ${order.paymentStatus}
              </span>
            </td>
            <td>
              <span class="order-status ${order.status}">
                ${order.status}
              </span>
            </td>
            <td>
              <select class="admin-select"
                onchange="updateOrderStatus('${order._id}', this.value)"
                style="font-size:0.72rem;padding:4px 8px">
                <option value="pending"
                  ${order.status === 'pending' ? 'selected' : ''}>
                  Pending
                </option>
                <option value="processing"
                  ${order.status === 'processing' ? 'selected' : ''}>
                  Processing
                </option>
                <option value="shipped"
                  ${order.status === 'shipped' ? 'selected' : ''}>
                  Shipped
                </option>
                <option value="delivered"
                  ${order.status === 'delivered' ? 'selected' : ''}>
                  Delivered
                </option>
                <option value="cancelled"
                  ${order.status === 'cancelled' ? 'selected' : ''}>
                  Cancelled
                </option>
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(
      `${ADMIN_API}/orders/${orderId}/status`,
      {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status })
      }
    );
    const data = await response.json();
    if (data.success) {
      loadOrders();
      loadDashboard();
    }
  } catch (error) {
    console.error('Update status error:', error);
  }
}


// ================================
// PRODUCTS
// ================================
let editingProductId = null;

async function loadProducts() {
  try {
    const response = await fetch(`${ADMIN_API}/products`, {
      headers: authHeaders
    });
    const data = await response.json();
    const products = data.products || [];

    document.getElementById('products-count').textContent =
      `${products.length} products`;

    const container = document.getElementById('products-list');

    if (products.length === 0) {
      container.innerHTML =
        '<p class="admin-empty">No products yet. Add your first product above!</p>';
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-row">
        <img class="product-row__img"
          src="${product.images?.[0] || product.image || ''}"
          alt="${product.name}"
          onerror="this.style.background='#333'"
        />
        <div class="product-row__info">
          <p class="product-row__name">${product.name}</p>
          <p class="product-row__meta">
            ${product.category} ·
            ${product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
          </p>
          <p class="product-row__price">
            ₦${product.price.toLocaleString('en-NG')}
          </p>
        </div>
        <div class="product-row__actions">
          <button class="admin-btn-edit"
            onclick="editProduct(${JSON.stringify(product).replace(/"/g, '&quot;')})">
            Edit
          </button>
          <button class="admin-btn-danger"
            onclick="deleteProduct('${product._id}')">
            Delete
          </button>
        </div>
      </div>
    `).join('');

  } catch (error) {
    document.getElementById('products-list').innerHTML =
      '<p class="admin-empty">Could not load products</p>';
  }
}

async function saveProduct() {
  const name = document.getElementById('p-name').value.trim();
  const price = document.getElementById('p-price').value;
  const description = document.getElementById('p-description').value.trim();
  const category = document.getElementById('p-category').value;
  const tag = document.getElementById('p-tag').value;
  const image = document.getElementById('p-image').value.trim();
  const inStock = document.getElementById('p-instock').value === 'true';
  const errorEl = document.getElementById('product-form-error');
  const successEl = document.getElementById('product-form-success');

  const sizes = Array.from(
    document.querySelectorAll('.sizes-check input:checked')
  ).map(cb => cb.value);

  errorEl.textContent = '';
  successEl.textContent = '';

  if (!name || !price || !description || !category || !image) {
    errorEl.textContent = 'Please fill in all required fields.';
    return;
  }

  const productData = {
    name,
    price: parseInt(price),
    description,
    category,
    tag,
    images: [image],
    sizes,
    inStock
  };

  try {
    const url = editingProductId
      ? `${ADMIN_API}/products/${editingProductId}`
      : `${ADMIN_API}/products`;

    const method = editingProductId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify(productData)
    });

    const data = await response.json();

    if (data.success) {
      successEl.textContent = editingProductId
        ? '✓ Product updated successfully!'
        : '✓ Product added successfully!';
      clearProductForm();
      loadProducts();
      loadDashboard();
      setTimeout(() => successEl.textContent = '', 3000);
    } else {
      errorEl.textContent = data.message || 'Could not save product';
    }

  } catch (error) {
    errorEl.textContent = 'Something went wrong. Please try again.';
  }
}

function editProduct(product) {
  editingProductId = product._id;
  document.getElementById('p-name').value = product.name;
  document.getElementById('p-price').value = product.price;
  document.getElementById('p-description').value = product.description;
  document.getElementById('p-category').value = product.category;
  document.getElementById('p-tag').value = product.tag || 'New In';
  document.getElementById('p-image').value =
    product.images?.[0] || product.image || '';
  document.getElementById('p-instock').value =
    product.inStock ? 'true' : 'false';

  // Check sizes
  document.querySelectorAll('.sizes-check input').forEach(cb => {
    cb.checked = product.sizes?.includes(cb.value);
  });

  document.getElementById('product-form-title').textContent = 'Edit Product';
  document.getElementById('save-product-btn').textContent = 'Update Product';
  document.getElementById('cancel-edit-btn').style.display = 'block';

  // Scroll to form
  document.querySelector('.admin-card').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  clearProductForm();
}

function clearProductForm() {
  editingProductId = null;
  document.getElementById('p-name').value = '';
  document.getElementById('p-price').value = '';
  document.getElementById('p-description').value = '';
  document.getElementById('p-category').value = '';
  document.getElementById('p-tag').value = 'New In';
  document.getElementById('p-image').value = '';
  document.getElementById('p-instock').value = 'true';
  document.querySelectorAll('.sizes-check input').forEach(cb => {
    cb.checked = false;
  });
  document.getElementById('product-form-title').textContent = 'Add New Product';
  document.getElementById('save-product-btn').textContent = 'Add Product';
  document.getElementById('cancel-edit-btn').style.display = 'none';
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const response = await fetch(`${ADMIN_API}/products/${productId}`, {
      method: 'DELETE',
      headers: authHeaders
    });

    const data = await response.json();

    if (data.success) {
      loadProducts();
      loadDashboard();
    }
  } catch (error) {
    console.error('Delete error:', error);
  }
}


// ================================
// MESSAGES
// ================================
async function loadMessages() {
  try {
    const response = await fetch(`${ADMIN_API}/contact`, {
      headers: authHeaders
    });
    const data = await response.json();
    const messages = data.messages || [];

    document.getElementById('messages-count').textContent =
      `${messages.length} messages`;

    const container = document.getElementById('messages-list');

    if (messages.length === 0) {
      container.innerHTML =
        '<p class="admin-empty">No messages yet</p>';
      return;
    }

    container.innerHTML = messages.map(msg => `
      <div class="message-card">
        <div class="message-card__header">
          <div>
            <p class="message-card__from">
              ${msg.firstName} ${msg.lastName || ''}
            </p>
            <p class="message-card__email">${msg.email}</p>
          </div>
          <p class="message-card__date">
            ${new Date(msg.createdAt).toLocaleDateString('en-NG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
        <p class="message-card__subject">
          Subject: ${msg.subject || 'General'}
        </p>
        <p class="message-card__body">${msg.message}</p>
      </div>
    `).join('');

  } catch (error) {
    document.getElementById('messages-list').innerHTML =
      '<p class="admin-empty">Could not load messages</p>';
  }
}

// ================================
// USERS
// ================================
async function loadUsers() {
  try {
    const response = await fetch(`${ADMIN_API}/auth/users`, {
      headers: authHeaders
    });
    const data = await response.json();
    const users = data.users || [];

    document.getElementById('users-count').textContent =
      `${users.length} users`;

    // Update dashboard stat
    const statUsers = document.getElementById('stat-users');
    if (statUsers) statUsers.textContent = users.length;

    const container = document.getElementById('users-list');

    if (users.length === 0) {
      container.innerHTML =
        '<p class="admin-empty">No registered users yet</p>';
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td style="color:#fff;">${user.name}</td>
              <td style="color:#c9a84c;">${user.email}</td>
              <td>${new Date(user.createdAt).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</td>
              <td>${user.orderHistory?.length || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  } catch (error) {
    document.getElementById('users-list').innerHTML =
      '<p class="admin-empty">Could not load users</p>';
  }
}

// ================================
// INIT — Load all data
// ================================
loadDashboard();
loadOrders();
loadProducts();
loadMessages();
loadUsers();