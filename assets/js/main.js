/* ================================
   ZALAMS LUXURY — MAIN JS
   main.js
================================ */

// --- Navbar: Scrolled State ---
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});


// --- Navbar: Hamburger Toggle ---
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow =
    mobileMenu.classList.contains('open') ? 'hidden' : '';
});


// --- Close mobile menu when a link is clicked ---
const mobileLinks = mobileMenu.querySelectorAll('a');

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});


// Show first slide immediately without waiting
const firstSlide = document.querySelector('.hero__slide');
if (firstSlide) {
  firstSlide.classList.add('active');
  const firstImg = firstSlide.querySelector('img');
  if (firstImg) {
    // If image already cached, no flash
    if (firstImg.complete) {
      firstSlide.style.opacity = '1';
    } else {
      firstImg.addEventListener('load', () => {
        firstSlide.style.opacity = '1';
      });
    }
  }
}
// --- Hero Image Slider ---
const slides = document.querySelectorAll('.hero__slide');
const dots = document.querySelectorAll('.hero__dot');
let currentSlide = 0;
let sliderInterval;

function goToSlide(index) {
  // Remove active from current slide and dot
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  // Update current index
  currentSlide = index;

  // Add active to new slide and dot
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() {
  const next = (currentSlide + 1) % slides.length;
  goToSlide(next);
}

// Only run slider if slides exist on the page
if (slides.length > 0) {
  // Auto advance every 5 seconds
  sliderInterval = setInterval(nextSlide, 5000);

  // Clicking a dot manually jumps to that slide
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(sliderInterval);         // Reset timer on manual click
      goToSlide(parseInt(dot.dataset.index));
      sliderInterval = setInterval(nextSlide, 5000);
    });
  });
}


// --- Newsletter Subscription ---
function subscribeNewsletter() {
  const email = document.getElementById('newsletter-email').value.trim();

  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  const form = document.querySelector('.newsletter__form');
  form.innerHTML = `
    <p style="
      color: var(--color-gold);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-family: var(--font-heading);
      font-size: 1.5rem;
    ">
      Thank you for subscribing! 🎉
    </p>
  `;
}

// --- Search ---
const searchLink = document.querySelector('.search-link');
if (searchLink) {
  searchLink.addEventListener('click', (e) => {
    e.preventDefault();

    // Create search overlay
    const overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(245,245,243,0.98);
      display: flex; flex-direction: column;
      align-items: center; justify-content: flex-start;
      padding-top: 120px;
    `;

    overlay.innerHTML = `
      <div style="width:100%;max-width:600px;padding:0 24px;">
        <div style="display:flex;align-items:center;
          border-bottom:2px solid #111;margin-bottom:32px;">
          <input id="search-input" type="text"
            placeholder="Search products..."
            style="flex:1;padding:16px 0;font-size:1.2rem;
            border:none;background:transparent;outline:none;
            font-family:Inter,sans-serif;color:#111;" />
          <button onclick="document.getElementById('search-overlay').remove()"
            style="background:none;border:none;font-size:1.5rem;
            cursor:pointer;color:#888;padding:8px;">✕</button>
        </div>
        <div id="search-results"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = document.getElementById('search-input');
    input.focus();

    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      const results = document.getElementById('search-results');

      if (!query) {
        results.innerHTML = '';
        return;
      }

      const matches = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );

      if (matches.length === 0) {
        results.innerHTML = `
          <p style="color:#888;font-size:0.85rem;
            letter-spacing:0.1em;text-transform:uppercase;">
            No products found for "${query}"
          </p>
        `;
        return;
      }

      results.innerHTML = matches.map(p => `
        <a href="product.html?id=${p.id}"
          style="display:flex;gap:16px;align-items:center;
          padding:12px 0;border-bottom:1px solid #e8e8e4;
          text-decoration:none;color:#111;
          transition:padding-left 0.2s ease;"
          onmouseover="this.style.paddingLeft='8px'"
          onmouseout="this.style.paddingLeft='0'">
          <img src="${p.image}" alt="${p.name}"
            style="width:50px;height:60px;object-fit:cover;
            background:#f0f0ec;" />
          <div>
            <p style="font-size:0.85rem;font-weight:600;
              margin:0 0 4px;">${p.name}</p>
            <p style="font-size:0.82rem;color:#c9a84c;
              font-weight:700;margin:0;">
              ₦${p.price.toLocaleString('en-NG')}
            </p>
          </div>
        </a>
      `).join('');
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') overlay.remove();
    });
  });
}