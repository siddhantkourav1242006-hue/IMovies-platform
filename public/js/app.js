// Global Application Navigation, State & Event Management
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  setupMobileMenu();
  setupScrollEffects();
});

function initNavbar() {
  const navAuth = document.getElementById('nav-auth');
  const user = getCurrentUser();

  if (!navAuth) return;

  if (user) {
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    navAuth.innerHTML = `
      <div class="user-menu" id="user-menu-btn">
        <div class="user-avatar">${initial}</div>
        <span style="font-size:0.9rem; font-weight:600; color:#fff">${user.name.split(' ')[0]}</span>
        <i class="fas fa-chevron-down" style="font-size:0.75rem; color:var(--text-muted)"></i>

        <div class="user-dropdown" id="user-dropdown-menu">
          <a href="/pages/profile.html"><i class="fas fa-user-circle"></i> My Profile</a>
          <a href="/pages/bookings.html"><i class="fas fa-ticket-alt"></i> My Bookings</a>
          <a href="/pages/wishlist.html"><i class="fas fa-heart"></i> My Wishlist</a>
          ${user.role === 'admin' ? '<a href="/pages/admin.html"><i class="fas fa-shield-alt"></i> Admin Panel</a>' : ''}
          <hr/>
          <button id="logout-btn"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
        </div>
      </div>
    `;

    // Dropdown toggle
    const menuBtn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown-menu');
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', logout);
  } else {
    navAuth.innerHTML = `
      <a href="/pages/login.html" class="btn btn-secondary btn-sm">Sign In</a>
      <a href="/pages/register.html" class="btn btn-primary btn-sm">Sign Up</a>
    `;
  }
}

function setupMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  if (!hamburger || !navMobile) return;

  hamburger.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });

  const user = getCurrentUser();
  navMobile.innerHTML = `
    <a href="/" class="nav-link">Home</a>
    <a href="/pages/bookings.html" class="nav-link">My Bookings</a>
    <a href="/pages/wishlist.html" class="nav-link">Wishlist</a>
    ${user && user.role === 'admin' ? '<a href="/pages/admin.html" class="nav-link">Admin Dashboard</a>' : ''}
    <hr style="border:none; border-top:1px solid var(--border); margin:1rem 0;"/>
    ${
      user
        ? `<a href="/pages/profile.html" class="nav-link"><i class="fas fa-user"></i> ${user.name}</a>
           <button class="btn btn-danger btn-block" onclick="logout()" style="margin-top:1rem;">Logout</button>`
        : `<a href="/pages/login.html" class="btn btn-secondary btn-block">Sign In</a>
           <a href="/pages/register.html" class="btn btn-primary btn-block" style="margin-top:0.5rem;">Sign Up</a>`
    }
  `;
}

function setupScrollEffects() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

function logout() {
  localStorage.removeItem('imovies_token');
  localStorage.removeItem('imovies_user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = '/';
  }, 800);
}
