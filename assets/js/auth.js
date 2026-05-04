/* ================================
   ZALAMS LUXURY — AUTH JS
   assets/js/auth.js
================================ */


// --- Get logged in user from localStorage ---
function getUser() {
  const user = localStorage.getItem('zalams-user');
  return user ? JSON.parse(user) : null;
}


// --- Get token from localStorage ---
function getToken() {
  return localStorage.getItem('zalams-token');
}


// --- Save auth data after login/signup ---
// --- Save auth data after login/signup ---
function saveAuth(token, user) {
  localStorage.setItem('zalams-token', token);
  localStorage.setItem('zalams-user', JSON.stringify(user));
  // Reload cart for this user
  if (typeof reloadCart === 'function') reloadCart();
}

// --- Clear auth data on logout ---
function clearAuth() {
  localStorage.removeItem('zalams-token');
  localStorage.removeItem('zalams-user');
  // Reset cart to 0 on logout
  if (typeof reloadCart === 'function') reloadCart();
}

// --- Update navbar based on auth state ---
function updateNavbar() {
  const user = getUser();
  const accountLinks = document.querySelectorAll('.account-link');
  const guestMenus = document.querySelectorAll('#guest-menu');
  const userMenus = document.querySelectorAll('#user-menu');
  const accountMenus = document.querySelectorAll('#account-menu');

  accountLinks.forEach(link => {
    if (user) {
      link.textContent = `Hi, ${user.name.split(' ')[0]} ▾`;
      link.href = '#';
    } else {
      link.textContent = 'Account ▾';
      link.href = '#';
    }
  });

  // Show correct menu based on login state
  guestMenus.forEach(menu => {
    menu.style.display = user ? 'none' : 'block';
  });

  userMenus.forEach(menu => {
    menu.style.display = user ? 'block' : 'none';
  });

  // Always show dropdown menu
  accountMenus.forEach(menu => {
    menu.style.display = 'block';
  });
}

// --- Handle Signup ---
async function handleSignup() {
  const name = document.getElementById('signup-name')?.value.trim();
  const email = document.getElementById('signup-email')?.value.trim();
  const password = document.getElementById('signup-password')?.value;
  const confirm = document.getElementById('signup-confirm')?.value;
  const errorEl = document.getElementById('signup-error');
  const btn = document.getElementById('signup-btn');

  // Validation
  if (!name || !email || !password || !confirm) {
    errorEl.textContent = 'Please fill in all fields.';
    return;
  }

  if (password !== confirm) {
    errorEl.textContent = 'Passwords do not match.';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters.';
    return;
  }

  // Loading state
  btn.textContent = 'Creating Account...';
  btn.disabled = true;
  errorEl.textContent = '';

  try {
    const response = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (data.success) {
      saveAuth(data.token, data.user);
      // Redirect to home after signup
      window.location.href = 'index.html';
    } else {
      errorEl.textContent = data.message;
      btn.textContent = 'Create Account';
      btn.disabled = false;
    }

  } catch (error) {
    errorEl.textContent = 'Something went wrong. Please try again.';
    btn.textContent = 'Create Account';
    btn.disabled = false;
  }
}


// --- Handle Login ---
async function handleLogin() {
  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  // Validation
  if (!email || !password) {
    errorEl.textContent = 'Please enter your email and password.';
    return;
  }

  // Loading state
  btn.textContent = 'Logging In...';
  btn.disabled = true;
  errorEl.textContent = '';

  try {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      saveAuth(data.token, data.user);

      // Store full profile in localStorage
      localStorage.setItem('zalams-user', JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        phone: data.user.phone || '',
        address: data.user.address || {}
      }));

      // Redirect admin to admin panel, customers to home
      if (data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      errorEl.textContent = data.message;
      btn.textContent = 'Log In';
      btn.disabled = false;
    }

  } catch (error) {
    errorEl.textContent = 'Something went wrong. Please try again.';
    btn.textContent = 'Log In';
    btn.disabled = false;
  }
}

// --- Toggle Password Visibility ---
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = 'Hide';
  } else {
    input.type = 'password';
    btn.textContent = 'Show';
  }
}

// --- Handle Forgot Password ---
async function handleForgotPassword() {
  const email = document.getElementById('forgot-email')?.value.trim();
  const errorEl = document.getElementById('forgot-error');
  const btn = document.getElementById('forgot-btn');

  if (!email) {
    errorEl.textContent = 'Please enter your email address.';
    return;
  }

  btn.textContent = 'Sending...';
  btn.disabled = true;
  errorEl.textContent = '';

  try {
    const response = await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    // Replace form with success message
    document.getElementById('forgot-form').innerHTML = `
      <div style="text-align:center;padding:20px 0;">
        <p style="font-size:2rem;margin-bottom:16px;">📧</p>
        <h3 style="color:var(--color-gold);font-family:var(--font-heading);
          font-size:1.5rem;letter-spacing:0.08em;text-transform:uppercase;
          margin-bottom:12px;">
          Check Your Email!
        </h3>
        <p style="color:var(--color-grey);font-size:0.85rem;line-height:1.8;">
          If an account exists for <strong style="color:var(--color-white);">
          ${email}</strong>, we've sent a password reset link.
        </p>
        <a href="login.html" style="display:inline-block;margin-top:24px;
          color:var(--color-gold);font-size:0.82rem;letter-spacing:0.1em;
          text-transform:uppercase;">
          ← Back to Login
        </a>
      </div>
    `;

  } catch (error) {
    errorEl.textContent = 'Something went wrong. Please try again.';
    btn.textContent = 'Send Reset Link';
    btn.disabled = false;
  }
}


// --- Handle Reset Password ---
async function handleResetPassword() {
  const password = document.getElementById('reset-password')?.value;
  const confirm = document.getElementById('reset-confirm')?.value;
  const errorEl = document.getElementById('reset-error');
  const btn = document.getElementById('reset-btn');

  if (!password || !confirm) {
    errorEl.textContent = 'Please fill in both fields.';
    return;
  }

  if (password !== confirm) {
    errorEl.textContent = 'Passwords do not match.';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters.';
    return;
  }

  // Get token from URL
  const token = new URLSearchParams(window.location.search).get('token');
  if (!token) {
    errorEl.textContent = 'Invalid reset link. Please request a new one.';
    return;
  }

  btn.textContent = 'Resetting...';
  btn.disabled = true;

  try {
    const response = await fetch(`${API}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('reset-form').innerHTML = `
        <div style="text-align:center;padding:20px 0;">
          <p style="font-size:2rem;margin-bottom:16px;">✅</p>
          <h3 style="color:var(--color-gold);font-family:var(--font-heading);
            font-size:1.5rem;letter-spacing:0.08em;text-transform:uppercase;
            margin-bottom:12px;">
            Password Reset!
          </h3>
          <p style="color:var(--color-grey);font-size:0.85rem;line-height:1.8;">
            Your password has been reset successfully.
          </p>
          <a href="login.html" style="display:inline-block;margin-top:24px;
            padding:12px 32px;background:var(--color-gold);color:#000;
            font-weight:bold;text-decoration:none;text-transform:uppercase;
            letter-spacing:0.1em;font-size:0.85rem;">
            Log In Now →
          </a>
        </div>
      `;
    } else {
      errorEl.textContent = data.message || 'Could not reset password.';
      btn.textContent = 'Reset Password';
      btn.disabled = false;
    }

  } catch (error) {
    errorEl.textContent = 'Something went wrong. Please try again.';
    btn.textContent = 'Reset Password';
    btn.disabled = false;
  }
}

function toggleBothPasswords(checkbox) {
  const fields = [
    document.getElementById('signup-password'),
    document.getElementById('signup-confirm')
  ].filter(Boolean);
  
  fields.forEach(field => {
    field.type = checkbox.checked ? 'text' : 'password';
  });
}

// --- Handle Logout ---
function handleLogout() {
  clearAuth();
  window.location.href = 'index.html';
}

// --- Run on every page load ---
updateNavbar();