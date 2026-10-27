// Movie Detail & Showtimes Selection Page Logic
document.addEventListener('DOMContentLoaded', async () => {
  const movieId = getQueryParam('id') || getQueryParam('movie');
  if (!movieId) return;

  // Detail Page elements
  if (document.getElementById('detail-title')) {
    loadMovieDetails(movieId);
  }

  // Showtimes Page elements
  if (document.getElementById('showtimes-container')) {
    loadShowtimesPage(movieId);
  }
});

async function loadMovieDetails(movieId) {
  try {
    const res = await apiRequest(`/movies/${movieId}`);
    const movie = res.data;

    document.title = `${movie.title} — IMovies`;

    const heroBanner = document.getElementById('movie-hero');
    if (heroBanner) {
      heroBanner.style.backgroundImage = `url('${movie.bannerUrl || movie.posterUrl}')`;
    }

    const posterImg = document.getElementById('detail-poster-img');
    if (posterImg) posterImg.src = movie.posterUrl;

    document.getElementById('detail-title').innerText = movie.title;
    document.getElementById('detail-synopsis').innerText = movie.description;

    // Badges
    const badgeContainer = document.getElementById('detail-badges');
    if (badgeContainer) {
      badgeContainer.innerHTML = `
        <span class="badge badge-rating"><i class="fas fa-star"></i> ${movie.rating || '4.8'} (${movie.totalReviews || 0} reviews)</span>
        <span class="badge">${movie.duration} mins</span>
        <span class="badge">${movie.certification || 'UA'}</span>
        <span class="badge" style="color:var(--accent); border-color:var(--accent);">${movie.language}</span>
        ${movie.genre.map((g) => `<span class="badge">${g}</span>`).join('')}
      `;
    }

    // Cast list
    const castContainer = document.getElementById('cast-container');
    if (castContainer && movie.cast) {
      castContainer.innerHTML = movie.cast
        .map(
          (c) => `
        <div class="cast-card">
          <img src="${c.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" class="cast-photo" alt="${c.name}"/>
          <div class="cast-name">${c.name}</div>
          <div class="cast-role">${c.role}</div>
        </div>
      `
        )
        .join('');
    }

    // Booking & Trailer Buttons
    const bookBtn = document.getElementById('btn-book-tickets');
    if (bookBtn) {
      bookBtn.href = `/pages/showtimes.html?movie=${movie._id}`;
    }

    const trailerBtn = document.getElementById('btn-watch-trailer');
    if (trailerBtn && movie.trailerUrl) {
      trailerBtn.addEventListener('click', () => {
        openTrailerModal(movie.trailerUrl);
      });
    } else if (trailerBtn) {
      trailerBtn.style.display = 'none';
    }

    // Load Reviews
    if (window.loadReviewsForMovie) {
      window.loadReviewsForMovie(movieId);
    }
  } catch (err) {
    showToast('Failed to load movie details', 'error');
  }
}

function openTrailerModal(embedUrl) {
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  if (!modal || !iframe) return;

  iframe.src = embedUrl + '?autoplay=1';
  modal.classList.add('active');

  const closeBtn = document.getElementById('close-trailer-modal');
  if (closeBtn) {
    closeBtn.onclick = () => {
      iframe.src = '';
      modal.classList.remove('active');
    };
  }
  modal.onclick = (e) => {
    if (e.target === modal) {
      iframe.src = '';
      modal.classList.remove('active');
    }
  };
}

// ==========================================
// SHOWTIMES SELECTION LOGIC
// ==========================================
async function loadShowtimesPage(movieId) {
  const container = document.getElementById('showtimes-container');
  const datePicker = document.getElementById('date-picker-bar');

  // Load movie info for the banner
  try {
    const movieRes = await apiRequest(`/movies/${movieId}`);
    const movie = movieRes.data;

    document.getElementById('show-movie-poster').src = movie.posterUrl;
    document.getElementById('show-movie-title').innerText = movie.title;
    document.getElementById('show-movie-meta').innerText = `${movie.language} • ${movie.duration}m • ${movie.certification}`;
  } catch (e) {}

  // Generate 7-day Date Picker Pills
  let selectedDate = new Date();
  datePicker.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);

    const pill = document.createElement('div');
    pill.className = `date-pill ${i === 0 ? 'active' : ''}`;
    pill.innerHTML = `
      <span class="day">${i === 0 ? 'TODAY' : d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
      <span class="num">${d.getDate()}</span>
      <span class="month">${d.toLocaleDateString('en-US', { month: 'short' })}</span>
    `;

    pill.addEventListener('click', () => {
      document.querySelectorAll('.date-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      selectedDate = d;
      fetchShowsForDate(movieId, selectedDate);
    });

    datePicker.appendChild(pill);
  }

  fetchShowsForDate(movieId, selectedDate);
}

async function fetchShowsForDate(movieId, dateObj) {
  const container = document.getElementById('showtimes-container');
  container.innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--text-muted)">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p style="margin-top:0.8rem;">Finding theaters and showtimes...</p>
    </div>
  `;

  try {
    const dateStr = dateObj.toISOString();
    const res = await apiRequest(`/showtimes?movieId=${movieId}&date=${encodeURIComponent(dateStr)}`);
    const theaters = res.data;

    if (!theaters || theaters.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:4rem; color:var(--text-muted)">
          <i class="fas fa-calendar-times fa-3x" style="opacity:0.3; margin-bottom:1rem;"></i>
          <h3>No Showtimes Available</h3>
          <p>Please select another date or check back later.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    theaters.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'theater-card';
      card.innerHTML = `
        <div class="theater-header">
          <div>
            <h3 class="theater-name">${item.theater.name}</h3>
            <p class="theater-location"><i class="fas fa-map-marker-alt"></i> ${item.theater.location}</p>
          </div>
        </div>
        <div class="time-slots">
          ${item.shows
            .map(
              (show) => `
            <a href="/pages/seats.html?showtime=${show._id}" class="time-slot-btn">
              <span class="time-text">${show.time}</span>
              <span class="screen-tag">${show.screenName}</span>
            </a>
          `
            )
            .join('')}
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; color:var(--danger)">
        <p>Failed to load showtimes.</p>
      </div>
    `;
  }
}
