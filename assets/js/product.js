/* ================================
   ZALAMS LUXURY — PRODUCT JS
   product.js
================================ */

// --- Load product from URL param ---
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function loadProduct() {
  const productId = parseInt(getQueryParam('id'));
  const product = products.find(p => p.id === productId);

  if (!product) {
    document.querySelector('.product-detail').innerHTML =
      '<div class="container" style="padding:100px 0;text-align:center"><p style="color:var(--color-grey);font-size:1.5rem;font-family:var(--font-heading);letter-spacing:0.1em">PRODUCT NOT FOUND</p><a href="shop.html" style="color:var(--color-gold);margin-top:16px;display:inline-block">← Back to Shop</a></div>';
    return;
  }

  // Set page title
  document.title = `${product.name} — Zalams Luxury`;

  // Breadcrumb
  document.getElementById('breadcrumb-name').textContent = product.name;

  // Tag, Name, Price
  document.getElementById('product-tag').textContent = product.tag;
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-price').textContent = '₦' + product.price.toLocaleString('en-NG');

  // Multiple images (use same image for now, real photos later)
  const images = [product.image, product.image, product.image];

  // Main image
  const mainImg = document.getElementById('gallery-main-img');
  mainImg.src = images[0];
  mainImg.alt = product.name;

  // Thumbnails
  const thumbsContainer = document.getElementById('gallery-thumbs');
  thumbsContainer.innerHTML = images.map((img, i) => `
    <img
      class="gallery__thumb ${i === 0 ? 'active' : ''}"
      src="${img}"
      alt="${product.name} view ${i + 1}"
      data-index="${i}"
    />
  `).join('');

  // Thumbnail click → update main image
  thumbsContainer.querySelectorAll('.gallery__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbsContainer.querySelectorAll('.gallery__thumb')
        .forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImg.src = images[parseInt(thumb.dataset.index)];
    });
  });

  // Color options
  const colorNames = ['Black', 'White', 'Gold', 'Navy', 'Grey', 'Brown'];
  const colorContainer = document.getElementById('color-options');
  colorContainer.innerHTML = product.colors.map((color, i) => `
    <div
      class="color-option ${i === 0 ? 'active' : ''}"
      style="background-color: ${color}"
      data-color="${colorNames[i] || color}"
      title="${colorNames[i] || color}"
    ></div>
  `).join('');

  // Color click
  const colorNameDisplay = document.getElementById('selected-color-name');
  colorContainer.querySelectorAll('.color-option').forEach(opt => {
    opt.addEventListener('click', () => {
      colorContainer.querySelectorAll('.color-option')
        .forEach(c => c.classList.remove('active'));
      opt.classList.add('active');
      colorNameDisplay.textContent = opt.dataset.color;
    });
  });

  // Related products (same category, exclude current)
  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const relatedGrid = document.getElementById('related-grid');
  relatedGrid.innerHTML = related.length > 0
    ? related.map(createProductCard).join('')
    : products.filter(p => p.id !== product.id).slice(0, 4).map(createProductCard).join('');
}


// --- Size selector ---
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('selected-size').textContent = btn.dataset.size;
  });
});


// --- Quantity selector ---
let quantity = 1;
const qtyValue = document.getElementById('qty-value');

document.getElementById('qty-minus').addEventListener('click', () => {
  if (quantity > 1) {
    quantity--;
    qtyValue.textContent = quantity;
  }
});

document.getElementById('qty-plus').addEventListener('click', () => {
  if (quantity < 10) {
    quantity++;
    qtyValue.textContent = quantity;
  }
});


// --- Accordion ---
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.parentElement;
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));

    // Open clicked if it was closed
    if (!isOpen) item.classList.add('open');
  });
});


// --- Add to Cart ---
document.getElementById('btn-add-cart').addEventListener('click', () => {
  const size = document.getElementById('selected-size').textContent;
  if (size === 'Select a size') {
    alert('Please select a size first.');
    return;
  }
  const productId = parseInt(getQueryParam('id'));
  addToCart(productId, quantity);

  // Button feedback
  const btn = document.getElementById('btn-add-cart');
  btn.textContent = '✓ Added to Cart';
  btn.style.backgroundColor = 'var(--color-gold)';
  btn.style.color = '#000';
  setTimeout(() => {
    btn.textContent = 'Add to Cart';
    btn.style.backgroundColor = '';
    btn.style.color = '';
  }, 2000);
});


// --- Buy Now ---
document.getElementById('btn-buy-now').addEventListener('click', () => {
  const size = document.getElementById('selected-size').textContent;
  if (size === 'Select a size') {
    alert('Please select a size first.');
    return;
  }
  const productId = parseInt(getQueryParam('id'));
  addToCart(productId, quantity);
  window.location.href = 'cart.html';
});


// --- Init ---
loadProduct();
