/* ================================
   ZALAMS LUXURY — SHOP JS
   shop.js
================================ */

// --- Product Data ---
const products = [
  {
    id: 1,
    name: "Zalams Classic Tee",
    price: 25000,
    category: "men-tshirts",
    tag: "New In",
    colors: ["#000000", "#ffffff", "#c9a84c"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80"
  },
  {
    id: 2,
    name: "Luxury Leather Jacket",
    price: 120000,
    category: "men-outerwear",
    tag: "New In",
    colors: ["#000000", "#4a3728"],
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80"
  },
  {
    id: 3,
    name: "Zalams Denim",
    price: 45000,
    category: "men-denim",
    tag: "New In",
    colors: ["#1a237e", "#000000"],
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80"
  },
{
    id: 4,
    name: "Signature Hoodie",
    price: 55000,
    category: "men-tshirts",
    tag: "New In",
    colors: ["#000000", "#888888", "#c9a84c"],
    image: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&q=80"
  },
  {
    id: 5,
    name: "Zalams Gown",
    price: 85000,
    category: "women-gowns",
    tag: "New In",
    colors: ["#000000", "#c9a84c"],
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80"
  },
  {
    id: 6,
    name: "Premium Shoulder Bag",
    price: 65000,
    category: "bags",
    tag: "New In",
    colors: ["#000000", "#4a3728"],
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"
  },
  {
    id: 7,
    name: "Zalams Fitted Shirt",
    price: 35000,
    category: "men-shirts",
    tag: "New In",
    colors: ["#ffffff", "#000000", "#1a237e"],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80"
  },
  {
    id: 8,
    name: "Luxury Silk Top",
    price: 42000,
    category: "women-tops",
    tag: "New In",
    colors: ["#000000", "#c9a84c", "#ffffff"],
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80"
  }
];


// --- Helpers ---
function formatPrice(amount) {
  return '₦' + amount.toLocaleString('en-NG');
}

function renderColorDots(colors, prefix = 'card') {
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
        <img class="product-card__img" src="${product.image}"
          alt="${product.name}" loading="lazy" />
        <div class="product-card__overlay">
          <button class="product-card__overlay-btn"
            onclick="addToCart(${product.id})">Add to Cart</button>
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


// --- Shop Page Card (Richman-inspired) ---
function createShopCard(product) {
  return `
    <div class="shop-card" data-id="${product.id}">
      <div class="shop-card__img-wrap">
        <span class="shop-card__tag">${product.tag}</span>
        <img class="shop-card__img" src="${product.image}"
          alt="${product.name}" loading="lazy" />
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
  container.innerHTML = items.map(createProductCard).join('');
}

renderProducts('new-in-grid', products.slice(0, 8));
renderProducts('explore-grid', products.slice(3, 8));


// --- Shop Page Logic ---
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

function initShopPage() {
  const shopGrid = document.getElementById('shop-grid');
  if (!shopGrid) return;

  const tabs = document.querySelectorAll('.category-tab');
  const resultsCount = document.getElementById('results-count');

  // Read URL param once on load only
  let urlCategory = getQueryParam('category');

  // Determine which tab to activate on load
  let activeFilter = 'all';
  if (urlCategory) {
    if (urlCategory.startsWith('men')) activeFilter = 'men';
    else if (urlCategory.startsWith('women')) activeFilter = 'women';
    else if (['bags', 'hats', 'belts'].includes(urlCategory)) activeFilter = 'accessories';
  }

  function display(filter) {
    let items;

    // Only use URL category on first load
    if (urlCategory && filter === activeFilter) {
      items = products.filter(p => p.category === urlCategory);
    } else {
      items = filterProducts(filter);
    }

    resultsCount.textContent = items.length;
    shopGrid.innerHTML = items.length === 0
      ? `<div class="no-results"><p>No products found</p></div>`
      : items.map(createShopCard).join('');
  }

  function setActive(filter) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Clear URL category completely when any tab is clicked
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

initShopPage();