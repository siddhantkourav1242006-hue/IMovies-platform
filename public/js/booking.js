// Booking History & Confirmation E-Ticket Rendering Logic
document.addEventListener('DOMContentLoaded', () => {
  // If on confirmation page
  if (document.getElementById('ticket-container')) {
    loadConfirmationTicket();
  }

  // If on My Bookings page
  if (document.getElementById('bookings-list-container')) {
    requireAuth();
    loadMyBookings();
  }
});

// ==========================================
// CONFIRMATION E-TICKET
// ==========================================
async function loadConfirmationTicket() {
  const bookingId = getQueryParam('id');
  if (!bookingId) {
    window.location.href = '/pages/bookings.html';
    return;
  }

  try {
    const res = await apiRequest(`/bookings/${bookingId}`);
    const booking = res.data;

    document.getElementById('t-booking-id').innerText = booking.bookingId;
    document.getElementById('t-movie-title').innerText = booking.movie.title;
    document.getElementById('t-theater').innerText = `${booking.theater.name} • Screen ${booking.showtime.screenIndex + 1}`;
    document.getElementById('t-datetime').innerText = `${formatDateDisplay(booking.showtime.date)} | ${booking.showtime.time}`;
    document.getElementById('t-seats').innerText = booking.seats.map((s) => s.label).join(', ');
    document.getElementById('t-total').innerText = formatCurrency(booking.totalAmount);
    document.getElementById('t-status').innerText = booking.status.toUpperCase();

    // Generate QR Code if library loaded
    const qrCanvas = document.getElementById('qr-canvas');
    if (qrCanvas && window.QRCode) {
      QRCode.toCanvas(
        qrCanvas,
        `IMOVIES-VERIFIED:${booking.bookingId}|SEATS:${booking.seats.map((s) => s.label).join(',')}|STATUS:PAID`,
        { width: 140, margin: 1, color: { dark: '#00d4ff', light: '#181822' } },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  } catch (err) {
    showToast('Failed to load booking ticket', 'error');
  }
}

// ==========================================
// MY BOOKINGS LISTING
// ==========================================
async function loadMyBookings(status = 'all') {
  const container = document.getElementById('bookings-list-container');
  container.innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--text-muted)">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p style="margin-top:0.8rem;">Loading your bookings...</p>
    </div>
  `;

  try {
    const res = await apiRequest(`/bookings/my?status=${status}`);
    const bookings = res.data;

    if (!bookings || bookings.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:4rem; color:var(--text-muted)">
          <i class="fas fa-ticket-alt fa-3x" style="opacity:0.3; margin-bottom:1rem;"></i>
          <h3>No Bookings Yet</h3>
          <p>Book tickets to your favorite movies and they will show up here.</p>
          <a href="/" class="btn btn-primary" style="margin-top:1.5rem;">Explore Movies</a>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    bookings.forEach((b) => {
      const isCancelled = b.status === 'cancelled';
      const item = document.createElement('div');
      item.className = 'theater-card';
      item.style.borderLeft = `4px solid ${isCancelled ? 'var(--danger)' : 'var(--success)'}`;

      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
          <div>
            <span class="badge" style="background:${isCancelled ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}; color:${isCancelled ? 'var(--danger)' : 'var(--success)'}; margin-bottom:0.5rem; display:inline-block;">
              ${b.status.toUpperCase()}
            </span>
            <h3 style="font-size:1.2rem; font-weight:700; color:#fff;">${b.movie.title}</h3>
            <p style="font-size:0.85rem; color:var(--text-muted);">${b.theater.name}</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.1rem; font-weight:800; color:var(--accent);">${formatCurrency(b.totalAmount)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">ID: ${b.bookingId}</div>
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:1.5rem; margin-bottom:1.2rem; font-size:0.9rem; color:var(--text-secondary);">
          <div><i class="fas fa-calendar-alt"></i> ${formatDateDisplay(b.showtime.date)} • ${b.showtime.time}</div>
          <div><i class="fas fa-couch"></i> Seats: <strong style="color:#fff;">${b.seats.map((s) => s.label).join(', ')}</strong></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:1rem;">
          <a href="/pages/confirmation.html?id=${b.bookingId}" class="btn btn-secondary btn-sm">
            <i class="fas fa-qrcode"></i> View E-Ticket
          </a>
          ${
            !isCancelled
              ? `<button class="btn btn-danger btn-sm" onclick="cancelBookingAction('${b._id}')">
                   <i class="fas fa-times-circle"></i> Cancel Booking
                 </button>`
              : '<span style="font-size:0.8rem; color:var(--danger);">Refund Processed</span>'
          }
        </div>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Failed to load bookings</p>`;
  }
}

window.cancelBookingAction = async function (id) {
  if (!confirm('Are you sure you want to cancel this booking? Your seats will be released immediately.')) {
    return;
  }

  try {
    const res = await apiRequest(`/bookings/${id}/cancel`, { method: 'PUT' });
    showToast(res.message, 'info');
    loadMyBookings();
  } catch (err) {
    showToast(err.message, 'error');
  }
};
