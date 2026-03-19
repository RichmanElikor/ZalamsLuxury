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