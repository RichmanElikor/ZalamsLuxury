/* ================================
   ZALAMS LUXURY — ADMIN JS
   assets/js/admin.js
================================ */

const ADMIN_API = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';
const adminToken = localStorage.getItem('zalams-token');
const adminUser = JSON.parse(localStorage.getItem('zalams-user') || '{}');

// --- Redirect if not admin ---
if (!adminToken || !adminUser || adminUser.role !== 'admin') {
  window.location.href = '/login';
}

// --- Set admin name ---
const adminNameEl = document.getElementById('admin-user-name');
if (adminNameEl) adminNameEl.textContent = adminUser.name || 'Admin';

// --- Set current date ---
const dateEl = document.getElementById('current-date');
if (dateEl) {
  dateEl.textContent = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric',
    month: 'long', day: 'numeric'
  });
}

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

  const tab = document.getElementById(`tab-${tabName}`);
  const nav = document.querySelector(`[data-tab="${tabName}"]`);

  if (tab) tab.classList.add('active');
  if (nav) nav.classList.add('active');

  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.textContent =
      tabName.charAt(0).toUpperCase() + tabName.slice(1);
  }
}

document.querySelectorAll('.admin-nav__item').forEach(item => {
  item.addEventListener('click', () => switchTab(item.dataset.tab));
});


// ================================
// DASHBOARD
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

    const orders = ordersData.orders || [];
    const products = productsData.products || [];
    const messages = messagesData.messages || [];

    const revenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);

    const statOrders = document.getElementById('stat-orders');
    const statRevenue = document.getElementById('stat-revenue');
    const statProducts = document.getElementById('stat-products');
    const statMessages = document.getElementById('stat-messages');

    if (statOrders) statOrders.textContent = orders.length;
    if (statRevenue) statRevenue.textContent = '₦' + revenue.toLocaleString('en-NG');
    if (statProducts) statProducts.textContent = products.length;
    if (statMessages) statMessages.textContent = messages.filter(m => !m.read).length;

    renderRecentOrders(orders.slice(0, 5));

  } catch (error) {
    console.error('Dashboard error:', error);
  }
}

function renderRecentOrders(orders) {
  const container = document.getElementById('recent-orders-list');
  if (!container) return;

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
            <td>
              ${order.customerName}<br/>
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
            <td>
              ${new Date(order.createdAt).toLocaleDateString('en-NG')}
            </td>
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
    const container = document.getElementById('all-orders-list');
    if (container) container.innerHTML =
      '<p class="admin-empty">Could not load orders</p>';
  }
}

function filterOrders() {
  const filter = document.getElementById('order-filter')?.value;
  const filtered = filter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === filter);
  renderOrders(filtered);
}

function renderOrders(orders) {
  const container = document.getElementById('all-orders-list');
  if (!container) return;

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
          <th>Update</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td style="color:#c9a84c;cursor:pointer;"
              onclick="window.location.href='admin-order.html?id=${order._id}'">
              #${order._id.slice(-8).toUpperCase()} →
            </td>
            <td>
              ${order.customerName}<br/>
              <span style="font-size:0.7rem;color:#888">
                ${order.email}
              </span>
            </td>
            <td>
              ${order.items.map(item => `
                <div style="margin-bottom:8px;padding-bottom:8px;
                  border-bottom:1px solid #1a1a1a;">
                  <p style="color:#fff;font-size:0.78rem;
                    margin:0 0 2px;font-weight:500;">
                    ${item.name}
                  </p>
                  <p style="color:#888;font-size:0.7rem;margin:0;">
                    Qty: ${item.quantity}
                    ${item.size
                      ? `&nbsp;·&nbsp;<span style="color:#c9a84c;
                          font-weight:700;">Size: ${item.size}</span>`
                      : '<span style="color:#ff4444;">No size</span>'
                    }
                    &nbsp;·&nbsp;
                    ₦${(item.price * item.quantity).toLocaleString('en-NG')}
                  </p>
                </div>
              `).join('')}
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
            <td>
              <select class="admin-select"
                onchange="updateOrderStatus('${order._id}', this.value)"
                style="font-size:0.72rem;padding:4px 8px">
                <option value="pending"
                  ${order.status==='pending'?'selected':''}>Pending</option>
                <option value="processing"
                  ${order.status==='processing'?'selected':''}>Processing</option>
                <option value="shipped"
                  ${order.status==='shipped'?'selected':''}>Shipped</option>
                <option value="delivered"
                  ${order.status==='delivered'?'selected':''}>Delivered</option>
                <option value="cancelled"
                  ${order.status==='cancelled'?'selected':''}>Cancelled</option>
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
    await fetch(`${ADMIN_API}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status })
    });
    loadOrders();
    loadDashboard();
  } catch (error) {
    console.error('Update status error:', error);
  }
}


// ================================
// PRODUCTS
// ================================
let allProducts = [];
let editingProductId = null;

async function loadProducts() {
  try {
    const response = await fetch(`${ADMIN_API}/products`, {
      headers: authHeaders
    });
    const data = await response.json();
    allProducts = data.products || [];

    const countEl = document.getElementById('products-count');
    if (countEl) countEl.textContent = `${allProducts.length} products`;

    const container = document.getElementById('products-list');
    if (!container) return;

    if (allProducts.length === 0) {
      container.innerHTML =
        '<p class="admin-empty">No products yet. Add your first product above!</p>';
      return;
    }

    container.innerHTML = allProducts.map(product => `
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
            onclick="editProductById('${product._id}')">
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
    const container = document.getElementById('products-list');
    if (container) container.innerHTML =
      '<p class="admin-empty">Could not load products</p>';
  }
}

function editProductById(productId) {
  const product = allProducts.find(p => p._id === productId);
  if (product) editProduct(product);
}

function editProduct(product) {
  editingProductId = product._id;

  const name = document.getElementById('p-name');
  const price = document.getElementById('p-price');
  const desc = document.getElementById('p-description');
  const cat = document.getElementById('p-category');
  const tag = document.getElementById('p-tag');
  const img = document.getElementById('p-image');
  const imgUrl = document.getElementById('p-image-url');
  const instock = document.getElementById('p-instock');

  if (name) name.value = product.name;
  if (price) price.value = product.price;
  if (desc) desc.value = product.description;
  if (cat) cat.value = product.category;
  if (tag) tag.value = product.tag || 'New In';
  if (img) img.value = product.images?.[0] || product.image || '';
  if (imgUrl) imgUrl.value = product.images?.[0] || product.image || '';
  if (instock) instock.value = product.inStock ? 'true' : 'false';

  document.querySelectorAll('.sizes-check input').forEach(cb => {
    cb.checked = product.sizes?.includes(cb.value);
  });

  const titleEl = document.getElementById('product-form-title');
  const saveBtn = document.getElementById('save-product-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');

  if (titleEl) titleEl.textContent = 'Edit Product';
  if (saveBtn) saveBtn.textContent = 'Update Product';
  if (cancelBtn) cancelBtn.style.display = 'block';

  document.querySelector('.admin-card')?.scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  clearProductForm();
}

function clearProductForm() {
  editingProductId = null;

  const fields = ['p-name', 'p-price', 'p-description',
    'p-image', 'p-image-url'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const cat = document.getElementById('p-category');
  const tag = document.getElementById('p-tag');
  const instock = document.getElementById('p-instock');
  if (cat) cat.value = '';
  if (tag) tag.value = 'New In';
  if (instock) instock.value = 'true';

  document.querySelectorAll('.sizes-check input')
    .forEach(cb => cb.checked = false);

  const titleEl = document.getElementById('product-form-title');
  const saveBtn = document.getElementById('save-product-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');

  if (titleEl) titleEl.textContent = 'Add New Product';
  if (saveBtn) saveBtn.textContent = 'Add Product';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

async function saveProduct() {
  const name = document.getElementById('p-name')?.value.trim();
  const price = document.getElementById('p-price')?.value;
  const description = document.getElementById('p-description')?.value.trim();
  const category = document.getElementById('p-category')?.value;
  const tag = document.getElementById('p-tag')?.value;
  const image = document.getElementById('p-image')?.value.trim() ||
    document.getElementById('p-image-url')?.value.trim();
  const inStock = document.getElementById('p-instock')?.value === 'true';
  const errorEl = document.getElementById('product-form-error');
  const successEl = document.getElementById('product-form-success');

  const sizes = Array.from(
    document.querySelectorAll('.sizes-check input:checked')
  ).map(cb => cb.value);

  if (errorEl) errorEl.textContent = '';
  if (successEl) successEl.textContent = '';

  if (!name || !price || !description || !category || !image) {
    if (errorEl) errorEl.textContent = 'Please fill in all required fields.';
    return;
  }

  const productData = {
    name, price: parseInt(price),
    description, category, tag,
    images: [image], sizes, inStock
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
      if (successEl) {
        successEl.textContent = editingProductId
          ? '✓ Product updated!'
          : '✓ Product added!';
        setTimeout(() => successEl.textContent = '', 3000);
      }
      clearProductForm();
      loadProducts();
      loadDashboard();
    } else {
      if (errorEl) errorEl.textContent = data.message || 'Could not save';
    }

  } catch (error) {
    if (errorEl) errorEl.textContent = 'Something went wrong.';
  }
}

async function deleteProduct(productId) {
  if (!confirm('Delete this product?')) return;
  try {
    await fetch(`${ADMIN_API}/products/${productId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    loadProducts();
    loadDashboard();
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

    const countEl = document.getElementById('messages-count');
    if (countEl) countEl.textContent = `${messages.length} messages`;

    const container = document.getElementById('messages-list');
    if (!container) return;

    if (messages.length === 0) {
      container.innerHTML = '<p class="admin-empty">No messages yet</p>';
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
              year: 'numeric', month: 'short', day: 'numeric'
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
    const container = document.getElementById('messages-list');
    if (container) container.innerHTML =
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

    const countEl = document.getElementById('users-count');
    if (countEl) countEl.textContent = `${users.length} users`;

    const statEl = document.getElementById('stat-users');
    if (statEl) statEl.textContent = users.length;

    const container = document.getElementById('users-list');
    if (!container) return;

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
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td style="color:#fff">${user.name}</td>
              <td style="color:#c9a84c">${user.email}</td>
              <td>
                <span class="order-status ${user.role}">
                  ${user.role}
                </span>
              </td>
              <td>
                ${new Date(user.createdAt).toLocaleDateString('en-NG', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  } catch (error) {
    const container = document.getElementById('users-list');
    if (container) container.innerHTML =
      '<p class="admin-empty">Could not load users</p>';
  }
}


// ================================
// IMAGE UPLOAD
// ================================
async function previewImage(input) {
  const file = input.files[0];
  if (!file) return;

  const preview = document.getElementById('image-preview');
  const placeholder = document.getElementById('image-placeholder');
  const reader = new FileReader();

  reader.onload = (e) => {
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${ADMIN_API}/products/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: formData
    });
    const data = await response.json();
    if (data.success) {
      const imgInput = document.getElementById('p-image');
      const urlInput = document.getElementById('p-image-url');
      if (imgInput) imgInput.value = data.imageUrl;
      if (urlInput) urlInput.value = data.imageUrl;
    }
  } catch (error) {
    console.error('Upload error:', error);
    if (preview) {
      const imgInput = document.getElementById('p-image');
      if (imgInput) imgInput.value = preview.src;
    }
  }
}


// ================================
// INIT
// ================================
loadDashboard();
loadOrders();
loadProducts();
loadMessages();
loadUsers();