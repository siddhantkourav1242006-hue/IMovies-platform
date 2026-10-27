// Core Frontend Utilities & API Fetch Wrapper
const API_BASE = '/api';

// Standard API Request Helper
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('imovies_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  } catch (err) {
    console.error(`[API Error ${endpoint}]:`, err.message);
    throw err;
  }
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';

  toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// User state helpers
function getCurrentUser() {
  const str = localStorage.getItem('imovies_user');
  try {
    return str ? JSON.parse(str) : null;
  } catch (e) {
    return null;
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('imovies_token');
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

function requireAuth(redirectBack = true) {
  if (!isLoggedIn()) {
    showToast('Please login to continue', 'warning');
    const currentUrl = window.location.pathname + window.location.search;
    setTimeout(() => {
      window.location.href = `/pages/login.html?redirect=${encodeURIComponent(currentUrl)}`;
    }, 1000);
    return false;
  }
  return true;
}

// URL query parameter helper
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

// Formatting helpers
function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

function formatDateDisplay(dateInput) {
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
