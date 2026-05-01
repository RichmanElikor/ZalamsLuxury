/* ================================
   ZALAMS LUXURY — SHOP JS
   assets/js/shop.js
================================ */

var API = 'http://localhost:3000/api';

// --- Products array (will be filled from API) ---
let products = [];


// --- Fetch products from backend ---
async function fetchProducts() {
  try {
    const response = await fetch(`${API}/products`);
    const data = await response.json();

    if (data.success) {
      products = data.products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        category: p.category,
        tag: p.tag || 'New In',
        colors: p.colors || ['#000000'],
        image: p.images?.[0] || p.image || '',
        description: p.description,
        sizes: p.sizes || [],
        inStock: p.inStock
      }));
    }
  } catch (error) {
    console.error('Could not fetch products:', error);
    products = [];
  }
}


// --- Helpers ---
function formatPrice(amount) {
  return '₦' + amount.toLocaleString('en-NG');
}

function renderColorDots(colors, prefix = 'card') {
  if (!colors || colors.length === 0) return '';
  return colors.map(c =>
    `<span class="${prefix}__color-dot" style="background-color:${c}"></span>`
  ).join('');
}


// --- Homepage Product Card ---
function createProductCard(product) {
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-card__img-wrap">
        <span class="product-card__tag">${product.tag}</span>
        <img
          class="product-card__img"
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.src='assets/images/placeholder.jpg'"
        />
        <div class="product-card__overlay">
          <button class="product-card__overlay-btn"
            onclick="addToCart('${product.id}')">
            Add to Cart
          </button>
        </div>
      </div>
      <div class="product-card__info">
        <a href="product.html?id=${product.id}">
          <p class="product-card__name">${product.name}</p>
        </a>
        <p class="product-card__price">${formatPrice(product.price)}</p>
        <div class="product-card__colors">
          ${renderColorDots(product.colors, 'color')}
        </div>
      </div>
    </div>
  `;
}


// --- Shop Page Card ---
function createShopCard(product) {
  return `
    <div class="shop-card" data-id="${product.id}">
      <div class="shop-card__img-wrap">
        <span class="shop-card__tag">${product.tag}</span>
        <img
          class="shop-card__img"
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.src='assets/images/placeholder.jpg'"
        />
      </div>
      <div class="shop-card__body">
        <p class="shop-card__name">${product.name}</p>
        <p class="shop-card__price">${formatPrice(product.price)}</p>
        <div class="shop-card__colors">
          ${renderColorDots(product.colors, 'shop-card')}
        </div>
      </div>
      <a href="product.html?id=${product.id}">
        <button class="shop-card__btn">Select Options</button>
      </a>
    </div>
  `;
}


// --- Render Homepage Grids ---
function renderProducts(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px 0;">
        <p style="color:var(--color-grey);font-size:0.85rem;
          letter-spacing:0.1em;text-transform:uppercase;">
          No products yet. Check back soon!
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(createProductCard).join('');
}


// --- Shop Page Filter Logic ---
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function filterProducts(filter) {
  if (filter === 'all') return products;
  if (filter === 'men') return products.filter(p => p.category.startsWith('men'));
  if (filter === 'women') return products.filter(p => p.category.startsWith('women'));
  if (filter === 'accessories') {
    return products.filter(p => ['bags', 'hats', 'belts'].includes(p.category));
  }
  return products.filter(p => p.category === filter);
}


// --- Init Shop Page ---
function initShopPage() {
  const shopGrid = document.getElementById('shop-grid');
  if (!shopGrid) return;

  const tabs = document.querySelectorAll('.category-tab');
  const resultsCount = document.getElementById('results-count');
  let urlCategory = getQueryParam('category');

  let activeFilter = 'all';
  if (urlCategory) {
    if (urlCategory.startsWith('men')) activeFilter = 'men';
    else if (urlCategory.startsWith('women')) activeFilter = 'women';
    else if (['bags', 'hats', 'belts'].includes(urlCategory)) {
      activeFilter = 'accessories';
    }
  }

  function display(filter) {
    let items;
    if (urlCategory && filter === activeFilter) {
      items = products.filter(p => p.category === urlCategory);
    } else {
      items = filterProducts(filter);
    }

    if (resultsCount) resultsCount.textContent = items.length;

    shopGrid.innerHTML = items.length === 0
      ? `<div class="no-results"><p>No products found</p></div>`
      : items.map(createShopCard).join('');
  }

  function setActive(filter) {
    tabs.forEach(t =>
      t.classList.toggle('active', t.dataset.filter === filter)
    );
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      urlCategory = null;
      activeFilter = tab.dataset.filter;
      setActive(activeFilter);
      history.replaceState(null, '', 'shop.html');
      display(activeFilter);
    });
  });

  setActive(activeFilter);
  display(activeFilter);
}


// --- Init Product Detail Page ---
function initProductPage() {
  const productSection = document.querySelector('.product-detail');
  if (!productSection) return;

  const productId = getQueryParam('id');
  const product = products.find(p => p.id === productId);

  if (!product) {
    productSection.innerHTML = `
      <div class="container" style="padding:100px 0;text-align:center">
        <p style="color:var(--color-grey);font-size:1.5rem;
          font-family:var(--font-heading);letter-spacing:0.1em">
          PRODUCT NOT FOUND
        </p>
        <a href="shop.html"
          style="color:var(--color-gold);margin-top:16px;display:inline-block">
          ← Back to Shop
        </a>
      </div>
    `;
    return;
  }

  // Set page title
  document.title = `${product.name} — Zalams Luxury`;

  // Breadcrumb
  const breadcrumb = document.getElementById('breadcrumb-name');
  if (breadcrumb) breadcrumb.textContent = product.name;

  // Tag, Name, Price
  const tagEl = document.getElementById('product-tag');
  const nameEl = document.getElementById('product-name');
  const priceEl = document.getElementById('product-price');
  if (tagEl) tagEl.textContent = product.tag;
  if (nameEl) nameEl.textContent = product.name;
  if (priceEl) priceEl.textContent = formatPrice(product.price);

  // Main image
  const mainImg = document.getElementById('gallery-main-img');
  if (mainImg) {
    mainImg.src = product.image;
    mainImg.alt = product.name;
  }

  // Thumbnails
  const thumbsContainer = document.getElementById('gallery-thumbs');
  if (thumbsContainer) {
    const images = [product.image, product.image, product.image];
    thumbsContainer.innerHTML = images.map((img, i) => `
      <img
        class="gallery__thumb ${i === 0 ? 'active' : ''}"
        src="${img}"
        alt="${product.name} view ${i + 1}"
        data-index="${i}"
      />
    `).join('');

    thumbsContainer.querySelectorAll('.gallery__thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbsContainer.querySelectorAll('.gallery__thumb')
          .forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        if (mainImg) mainImg.src = images[parseInt(thumb.dataset.index)];
      });
    });
  }

  // Color options
  const colorNames = ['Black', 'White', 'Gold', 'Navy', 'Grey', 'Brown'];
  const colorContainer = document.getElementById('color-options');
  if (colorContainer) {
    colorContainer.innerHTML = (product.colors || []).map((color, i) => `
      <div
        class="color-option ${i === 0 ? 'active' : ''}"
        style="background-color: ${color}"
        data-color="${colorNames[i] || color}"
        title="${colorNames[i] || color}"
      ></div>
    `).join('');

    const colorNameDisplay = document.getElementById('selected-color-name');
    colorContainer.querySelectorAll('.color-option').forEach(opt => {
      opt.addEventListener('click', () => {
        colorContainer.querySelectorAll('.color-option')
          .forEach(c => c.classList.remove('active'));
        opt.classList.add('active');
        if (colorNameDisplay) colorNameDisplay.textContent = opt.dataset.color;
      });
    });
  }

  // Related products
  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid) {
    const relatedItems = related.length > 0
      ? related
      : products.filter(p => p.id !== product.id).slice(0, 4);
    relatedGrid.innerHTML = relatedItems.map(createProductCard).join('');
  }
}


// ================================
// MAIN INIT — runs on every page
// ================================
async function init() {
  // Fetch products from API
  await fetchProducts();

  // Homepage grids
  const newInGrid = document.getElementById('new-in-grid');
  const exploreGrid = document.getElementById('explore-grid');

  if (newInGrid) renderProducts('new-in-grid', products.slice(0, 8));
  if (exploreGrid) renderProducts('explore-grid', products.slice(4, 8));

  // Shop page
  initShopPage();

  // Product detail page
  initProductPage();
  // Auto refresh products every 30 seconds
  setInterval(async () => {
    await fetchProducts();
    const newInGrid = document.getElementById('new-in-grid');
    const exploreGrid = document.getElementById('explore-grid');
    if (newInGrid) renderProducts('new-in-grid', products.slice(0, 8));
    if (exploreGrid) renderProducts('explore-grid', products.slice(4, 8));
    initShopPage();
  }, 30000);
}

init();