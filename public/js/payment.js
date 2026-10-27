// Payment & Checkout Processing Logic
let checkoutData = null;
let appliedDiscount = 0;
let appliedCouponCode = '';

document.addEventListener('DOMContentLoaded', () => {
  const stored = sessionStorage.getItem('imovies_checkout');
  if (!stored) {
    showToast('Session expired, please select seats again', 'warning');
    setTimeout(() => (window.location.href = '/'), 1500);
    return;
  }

  checkoutData = JSON.parse(stored);
  renderOrderSummary();
  setupCouponHandler();
  setupCardFormHandler();
});

function renderOrderSummary() {
  const { showtimeData, seats, fnbItems, ticketSubtotal, fnbTotal, convenienceFee } = checkoutData;

  document.getElementById('summary-movie-title').innerText = showtimeData.movie.title;
  document.getElementById('summary-theater').innerText = `${showtimeData.theater.name} (${showtimeData.theater.location})`;
  document.getElementById('summary-datetime').innerText = `${formatDateDisplay(showtimeData.date)} | ${showtimeData.time}`;

  document.getElementById('summary-seats-list').innerText = seats.map((s) => s.label).join(', ');
  document.getElementById('summary-ticket-subtotal').innerText = formatCurrency(ticketSubtotal);

  // F&B row
  const fnbRow = document.getElementById('summary-fnb-row');
  if (fnbTotal > 0) {
    fnbRow.style.display = 'flex';
    document.getElementById('summary-fnb-total').innerText = formatCurrency(fnbTotal);
  } else {
    fnbRow.style.display = 'none';
  }

  document.getElementById('summary-convenience-fee').innerText = formatCurrency(convenienceFee);

  calculateGrandTotal();
}

function calculateGrandTotal() {
  const { ticketSubtotal, fnbTotal, convenienceFee } = checkoutData;
  const rawTotal = ticketSubtotal + fnbTotal + convenienceFee;
  const grandTotal = Math.max(0, rawTotal - appliedDiscount);

  document.getElementById('summary-grand-total').innerText = formatCurrency(grandTotal);
  document.getElementById('btn-pay-text').innerText = `Pay ${formatCurrency(grandTotal)}`;

  // Discount row
  const discountRow = document.getElementById('summary-discount-row');
  if (appliedDiscount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('summary-discount-amount').innerText = `-${formatCurrency(appliedDiscount)}`;
  } else {
    discountRow.style.display = 'none';
  }
}

function setupCouponHandler() {
  const btn = document.getElementById('btn-apply-coupon');
  const input = document.getElementById('coupon-input');

  btn.addEventListener('click', async () => {
    const code = input.value.trim().toUpperCase();
    if (!code) return showToast('Please enter a coupon code', 'warning');

    try {
      btn.disabled = true;
      btn.innerText = 'Validating...';

      const res = await apiRequest('/coupons/validate', {
        method: 'POST',
        body: { code, subtotal: checkoutData.ticketSubtotal },
      });

      appliedDiscount = res.data.discountAmount;
      appliedCouponCode = res.data.code;

      showToast(res.data.message, 'success');
      input.disabled = true;
      btn.style.display = 'none';

      document.getElementById('coupon-success-msg').innerHTML = `
        <span style="color:var(--success); font-size:0.85rem;"><i class="fas fa-check-circle"></i> Applied: ${res.data.code} (-${formatCurrency(appliedDiscount)})</span>
      `;

      calculateGrandTotal();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Apply';
    }
  });
}

function setupCardFormHandler() {
  const form = document.getElementById('payment-form');
  const payBtn = document.getElementById('btn-submit-payment');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      payBtn.disabled = true;
      payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Securing Tickets...';

      // Submit booking to backend
      const bookingPayload = {
        showtimeId: checkoutData.showtimeId,
        seats: checkoutData.seats,
        fnbItems: checkoutData.fnbItems,
        couponCode: appliedCouponCode,
      };

      const res = await apiRequest('/bookings', {
        method: 'POST',
        body: bookingPayload,
      });

      const confirmedBooking = res.data;
      sessionStorage.removeItem('imovies_checkout');
      sessionStorage.setItem('imovies_latest_booking', JSON.stringify(confirmedBooking));

      showToast('Booking Confirmed! Generating your E-Ticket...', 'success');
      setTimeout(() => {
        window.location.href = `/pages/confirmation.html?id=${confirmedBooking.bookingId}`;
      }, 1200);
    } catch (err) {
      showToast(err.message, 'error');
      payBtn.disabled = false;
      payBtn.innerHTML = `Pay ${document.getElementById('summary-grand-total').innerText}`;
    }
  });
}
