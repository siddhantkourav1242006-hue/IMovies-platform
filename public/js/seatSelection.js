// Interactive Seat Map Engine & F&B Add-ons Logic
let showtimeData = null;
let selectedSeats = []; // Array of seat objects { row, number, type, label, price }
let fnbItemsList = [];
let fnbQuantities = {}; // { itemId: quantity }

document.addEventListener('DOMContentLoaded', async () => {
  const showtimeId = getQueryParam('showtime');
  if (!showtimeId) {
    showToast('No showtime selected', 'error');
    setTimeout(() => (window.location.href = '/'), 1000);
    return;
  }

  await loadShowtimeInfo(showtimeId);
  await loadSeatLayout(showtimeId);
  await loadFnBItems();
  setupProceedAction(showtimeId);
});

async function loadShowtimeInfo(showtimeId) {
  try {
    const res = await apiRequest(`/showtimes/${showtimeId}`);
    showtimeData = res.data;

    document.getElementById('info-movie-title').innerText = showtimeData.movie.title;
    document.getElementById('info-theater').innerText = `${showtimeData.theater.name} • Screen ${showtimeData.screenIndex + 1}`;
    document.getElementById('info-datetime').innerText = `${formatDateDisplay(showtimeData.date)} | ${showtimeData.time}`;
  } catch (err) {
    showToast('Failed to load show details', 'error');
  }
}

async function loadSeatLayout(showtimeId) {
  const container = document.getElementById('seat-map-container');
  container.innerHTML = `<i class="fas fa-spinner fa-spin fa-2x" style="color:var(--accent)"></i>`;

  try {
    const res = await apiRequest(`/showtimes/${showtimeId}/seats`);
    const { sections, bookedSeats, price } = res.data;

    container.innerHTML = '';

    sections.forEach((sec) => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'seat-section';

      sectionEl.innerHTML = `
        <div class="section-label-bar">
          <span>${sec.label}</span>
          <span style="color:var(--accent)">${formatCurrency(sec.price)}</span>
        </div>
      `;

      sec.rows.forEach((row) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'seat-row';

        const rowLetter = document.createElement('div');
        rowLetter.className = 'row-letter';
        rowLetter.innerText = row.row;
        rowEl.appendChild(rowLetter);

        row.seats.forEach((seat, idx) => {
          // Aisle spacing after 2nd seat and 4 seats before end
          if (idx === 2 || idx === row.seats.length - 2) {
            const gap = document.createElement('div');
            gap.className = 'aisle-gap';
            rowEl.appendChild(gap);
          }

          const seatEl = document.createElement('div');
          seatEl.className = `seat ${seat.type} ${seat.isBooked ? 'booked' : ''}`;
          seatEl.innerText = seat.number;
          seatEl.title = `${seat.label} — ${formatCurrency(seat.price)}`;

          if (!seat.isBooked) {
            seatEl.addEventListener('click', () => toggleSeatSelection(seat, seatEl));
          }

          rowEl.appendChild(seatEl);
        });

        sectionEl.appendChild(rowEl);
      });

      container.appendChild(sectionEl);
    });
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Failed to load seat layout</p>`;
  }
}

function toggleSeatSelection(seat, seatEl) {
  const existingIdx = selectedSeats.findIndex((s) => s.label === seat.label);

  if (existingIdx > -1) {
    // Unselect
    selectedSeats.splice(existingIdx, 1);
    seatEl.classList.remove('selected');
  } else {
    // Max 10 seats limit
    if (selectedSeats.length >= 10) {
      return showToast('You can select a maximum of 10 seats per booking', 'warning');
    }
    selectedSeats.push(seat);
    seatEl.classList.add('selected');
  }

  updateSummaryBar();
}

function updateSummaryBar() {
  const bar = document.getElementById('booking-summary-bar');
  const pillsContainer = document.getElementById('selected-seats-pills');
  const countSpan = document.getElementById('seats-count');
  const totalSpan = document.getElementById('subtotal-amount');

  if (selectedSeats.length === 0) {
    bar.classList.remove('active');
    return;
  }

  bar.classList.add('active');
  countSpan.innerText = `${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`;

  pillsContainer.innerHTML = selectedSeats
    .map((s) => `<span class="seat-pill">${s.label} (${formatCurrency(s.price)})</span>`)
    .join('');

  const ticketSubtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const fnbTotal = calculateFnBTotal();
  const grandTotal = ticketSubtotal + fnbTotal + 30; // 30 is convenience fee

  totalSpan.innerText = formatCurrency(grandTotal);
}

async function loadFnBItems() {
  const container = document.getElementById('fnb-grid-container');
  if (!container) return;

  try {
    const res = await apiRequest('/fnb');
    fnbItemsList = res.data.rawItems || [];
    const categories = res.data.categories || [];

    container.innerHTML = '';
    categories.forEach((cat) => {
      const block = document.createElement('div');
      block.className = 'fnb-category-block';
      block.innerHTML = `
        <h4 class="fnb-category-title">${cat.title}</h4>
        <div class="fnb-grid">
          ${cat.items
            .map(
              (item) => `
            <div class="fnb-item-card">
              <div class="fnb-meta">
                <div class="name">${item.image || '🍿'} ${item.name}</div>
                <div class="price">${formatCurrency(item.price)}</div>
              </div>
              <div class="fnb-counter">
                <button class="counter-btn" onclick="updateFnB('${item._id}', -1)">-</button>
                <span id="qty-${item._id}" style="font-weight:700; width:20px; text-align:center;">0</span>
                <button class="counter-btn" onclick="updateFnB('${item._id}', 1)">+</button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
      container.appendChild(block);
    });
  } catch (err) {}
}

window.updateFnB = function (itemId, delta) {
  const current = fnbQuantities[itemId] || 0;
  const next = Math.max(0, current + delta);
  fnbQuantities[itemId] = next;

  const el = document.getElementById(`qty-${itemId}`);
  if (el) el.innerText = next;

  updateSummaryBar();
};

function calculateFnBTotal() {
  let total = 0;
  for (const [id, qty] of Object.entries(fnbQuantities)) {
    const item = fnbItemsList.find((f) => f._id === id);
    if (item && qty > 0) {
      total += item.price * qty;
    }
  }
  return total;
}

function setupProceedAction(showtimeId) {
  const btn = document.getElementById('btn-proceed-checkout');
  btn.addEventListener('click', () => {
    if (selectedSeats.length === 0) {
      return showToast('Please select at least 1 seat', 'warning');
    }

    if (!requireAuth()) return;

    // Build F&B payload
    const selectedFnB = [];
    for (const [id, qty] of Object.entries(fnbQuantities)) {
      const item = fnbItemsList.find((f) => f._id === id);
      if (item && qty > 0) {
        selectedFnB.push({
          item: item._id,
          name: item.name,
          quantity: qty,
          price: item.price,
        });
      }
    }

    // Save to session storage
    const checkoutData = {
      showtimeId,
      showtimeData,
      seats: selectedSeats,
      fnbItems: selectedFnB,
      ticketSubtotal: selectedSeats.reduce((s, seat) => s + seat.price, 0),
      fnbTotal: calculateFnBTotal(),
      convenienceFee: 30,
    };

    sessionStorage.setItem('imovies_checkout', JSON.stringify(checkoutData));
    window.location.href = '/pages/payment.html';
  });
}
