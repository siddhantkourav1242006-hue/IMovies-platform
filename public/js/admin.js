// Admin Control Panel & Full Management Suite
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  if (!isAdmin()) {
    showToast('Access Denied. Administrator role required.', 'error');
    setTimeout(() => (window.location.href = '/'), 1200);
    return;
  }

  setupAdminTabs();
  loadAdminOverview();
  loadAdminMovies();
  loadAdminBookings();
  loadAdminCoupons();
  loadAdminFnB();
});

function setupAdminTabs() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const sections = document.querySelectorAll('.admin-section');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      navItems.forEach((i) => i.classList.remove('active'));
      sections.forEach((s) => (s.style.display = 'none'));

      item.classList.add('active');
      const target = item.dataset.target;
      const el = document.getElementById(`section-${target}`);
      if (el) el.style.display = 'block';
    });
  });
}

// 1. Overview Statistics
async function loadAdminOverview() {
  try {
    const moviesRes = await apiRequest('/movies?limit=100');
    const bookingsRes = await apiRequest('/bookings');

    const totalMovies = moviesRes.total || 0;
    const bookings = bookingsRes.data || [];
    const totalBookings = bookings.length;

    let revenue = 0;
    bookings.forEach((b) => {
      if (b.status === 'confirmed') revenue += b.totalAmount;
    });

    document.getElementById('stat-total-movies').innerText = totalMovies;
    document.getElementById('stat-total-bookings').innerText = totalBookings;
    document.getElementById('stat-total-revenue').innerText = formatCurrency(revenue);
  } catch (err) {}
}

// 2. Movies Management
async function loadAdminMovies() {
  const tbody = document.getElementById('admin-movies-tbody');
  if (!tbody) return;

  try {
    const res = await apiRequest('/movies?limit=50');
    const movies = res.data;

    tbody.innerHTML = movies
      .map(
        (m) => `
      <tr>
        <td><img src="${m.posterUrl}" style="width:40px; aspect-ratio:2/3; object-fit:cover; border-radius:4px;"/></td>
        <td><strong>${m.title}</strong></td>
        <td>${m.language}</td>
        <td>${m.genre.join(', ')}</td>
        <td><span class="badge ${m.status === 'now-showing' ? 'badge-rating' : ''}">${m.status}</span></td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteMovieAction('${m._id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join('');
  } catch (err) {}

  // Add Movie Form
  const addForm = document.getElementById('add-movie-form');
  if (addForm) {
    addForm.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('m-title').value.trim(),
        description: document.getElementById('m-desc').value.trim(),
        genre: document.getElementById('m-genre').value.split(',').map((g) => g.trim()),
        language: document.getElementById('m-lang').value.trim(),
        duration: Number(document.getElementById('m-duration').value),
        certification: document.getElementById('m-cert').value,
        posterUrl: document.getElementById('m-poster').value.trim(),
        bannerUrl: document.getElementById('m-banner').value.trim(),
        trailerUrl: document.getElementById('m-trailer').value.trim(),
        status: document.getElementById('m-status').value,
        featured: document.getElementById('m-featured').checked,
      };

      try {
        await apiRequest('/movies', { method: 'POST', body: payload });
        showToast('Movie published successfully!', 'success');
        addForm.reset();
        document.getElementById('modal-add-movie').classList.remove('active');
        loadAdminMovies();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }
}

window.deleteMovieAction = async function (id) {
  if (!confirm('Are you sure you want to delete this movie?')) return;
  try {
    await apiRequest(`/movies/${id}`, { method: 'DELETE' });
    showToast('Movie deleted', 'info');
    loadAdminMovies();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// 3. Bookings Ledger
async function loadAdminBookings() {
  const tbody = document.getElementById('admin-bookings-tbody');
  if (!tbody) return;

  try {
    const res = await apiRequest('/bookings');
    const bookings = res.data;

    tbody.innerHTML = bookings
      .map(
        (b) => `
      <tr>
        <td><strong>${b.bookingId}</strong></td>
        <td>${b.user ? b.user.name : 'User'}</td>
        <td>${b.movie ? b.movie.title : 'Movie'}</td>
        <td>${b.theater ? b.theater.name : 'Theater'}</td>
        <td>${b.seats.map((s) => s.label).join(', ')}</td>
        <td><strong>${formatCurrency(b.totalAmount)}</strong></td>
        <td>
          <span class="badge" style="background:${b.status === 'confirmed' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color:${b.status === 'confirmed' ? 'var(--success)' : 'var(--danger)'}">
            ${b.status}
          </span>
        </td>
      </tr>
    `
      )
      .join('');
  } catch (err) {}
}

// 4. Coupons Management
async function loadAdminCoupons() {
  const tbody = document.getElementById('admin-coupons-tbody');
  if (!tbody) return;

  try {
    const res = await apiRequest('/coupons');
    const coupons = res.data;

    tbody.innerHTML = coupons
      .map(
        (c) => `
      <tr>
        <td><strong style="color:var(--accent);">${c.code}</strong></td>
        <td>${c.discountType === 'percentage' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}</td>
        <td>${c.minBookingAmount ? formatCurrency(c.minBookingAmount) : 'None'}</td>
        <td>${c.usedCount} / ${c.usageLimit}</td>
        <td>${c.isActive ? '<span style="color:var(--success)">Active</span>' : '<span style="color:var(--danger)">Inactive</span>'}</td>
      </tr>
    `
      )
      .join('');
  } catch (err) {}

  const couponForm = document.getElementById('add-coupon-form');
  if (couponForm) {
    couponForm.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        code: document.getElementById('c-code').value.trim().toUpperCase(),
        discountType: document.getElementById('c-type').value,
        discountValue: Number(document.getElementById('c-val').value),
        maxDiscount: Number(document.getElementById('c-max').value || 0),
        minBookingAmount: Number(document.getElementById('c-min').value || 0),
        validUntil: new Date(document.getElementById('c-valid').value),
        usageLimit: Number(document.getElementById('c-limit').value || 100),
      };

      try {
        await apiRequest('/coupons', { method: 'POST', body: payload });
        showToast('Coupon created!', 'success');
        couponForm.reset();
        document.getElementById('modal-add-coupon').classList.remove('active');
        loadAdminCoupons();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }
}

// 5. F&B Catalog
async function loadAdminFnB() {
  const tbody = document.getElementById('admin-fnb-tbody');
  if (!tbody) return;

  try {
    const res = await apiRequest('/fnb');
    const items = res.data.rawItems || [];

    tbody.innerHTML = items
      .map(
        (i) => `
      <tr>
        <td>${i.image || '🍿'}</td>
        <td><strong>${i.name}</strong></td>
        <td>${i.category}</td>
        <td>${formatCurrency(i.price)}</td>
        <td>${i.isAvailable ? '<span style="color:var(--success)">Available</span>' : '<span style="color:var(--danger)">Out of Stock</span>'}</td>
      </tr>
    `
      )
      .join('');
  } catch (err) {}

  const fnbForm = document.getElementById('add-fnb-form');
  if (fnbForm) {
    fnbForm.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('f-name').value.trim(),
        category: document.getElementById('f-category').value,
        price: Number(document.getElementById('f-price').value),
        image: document.getElementById('f-icon').value.trim(),
        isAvailable: true,
      };

      try {
        await apiRequest('/fnb', { method: 'POST', body: payload });
        showToast('Snack item added!', 'success');
        fnbForm.reset();
        document.getElementById('modal-add-fnb').classList.remove('active');
        loadAdminFnB();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }
}
