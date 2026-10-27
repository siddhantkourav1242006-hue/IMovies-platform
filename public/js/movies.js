// Landing Page: Featured Carousel, Search, Filtering, and Movie Catalog
let currentGenre = 'All';
let currentLanguage = 'All';
let currentStatus = 'now-showing';
let searchQuery = '';
let carouselInterval = null;
let userWishlist = new Set();

document.addEventListener('DOMContentLoaded', async () => {
  await loadUserWishlist();
  loadFeaturedMovies();
  loadMovies();
  setupFilterHandlers();
});

async function loadUserWishlist() {
  if (!isLoggedIn()) return;
  try {
    const res = await apiRequest('/wishlist');
    if (res.data && res.data.movies) {
      userWishlist = new Set(res.data.movies.map((m) => (typeof m === 'object' ? m._id : m)));
    }
  } catch (err) {
    // Non-fatal
  }
}

async function loadFeaturedMovies() {
  const container = document.getElementById('hero-carousel');
  if (!container) return;

  try {
    const res = await apiRequest('/movies/featured');
    const movies = res.data;
    if (!movies || movies.length === 0) return;

    renderCarousel(movies);
  } catch (err) {
    console.error('Error loading featured movies:', err);
  }
}

function renderCarousel(movies) {
  const container = document.getElementById('hero-carousel');
  container.innerHTML = `
    <button class="carousel-nav-btn prev" id="carousel-prev"><i class="fas fa-chevron-left"></i></button>
    <button class="carousel-nav-btn next" id="carousel-next"><i class="fas fa-chevron-right"></i></button>
    <div class="carousel-dots" id="carousel-dots"></div>
  `;

  const dotsContainer = document.getElementById('carousel-dots');

  movies.forEach((movie, index) => {
    const slide = document.createElement('div');
    slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
    slide.style.backgroundImage = `url('${movie.bannerUrl || movie.posterUrl}')`;

    slide.innerHTML = `
      <div class="carousel-overlay">
        <div class="carousel-content">
          <div class="carousel-badges">
            <span class="badge badge-rating"><i class="fas fa-star"></i> ${movie.rating || '4.5'}</span>
            <span class="badge">${movie.duration} mins</span>
            <span class="badge">${movie.certification || 'UA'}</span>
            <span class="badge" style="background:var(--accent-glow); color:var(--accent); border-color:var(--accent);">${movie.language}</span>
          </div>
          <h1 class="carousel-title">${movie.title}</h1>
          <p class="carousel-desc">${movie.description}</p>
          <div class="carousel-actions">
            <a href="/pages/showtimes.html?movie=${movie._id}" class="btn btn-primary btn-lg">
              <i class="fas fa-ticket-alt"></i> Book Tickets
            </a>
            <a href="/pages/movie.html?id=${movie._id}" class="btn btn-secondary btn-lg">
              <i class="fas fa-info-circle"></i> Details
            </a>
          </div>
        </div>
      </div>
    `;
    container.appendChild(slide);

    // Dot
    const dot = document.createElement('div');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  let currentSlide = 0;
  const slides = container.querySelectorAll('.carousel-slide');
  const dots = dotsContainer.querySelectorAll('.dot');

  function goToSlide(idx) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (idx + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  document.getElementById('carousel-prev').addEventListener('click', () => {
    goToSlide(currentSlide - 1);
    resetCarouselTimer();
  });

  document.getElementById('carousel-next').addEventListener('click', () => {
    goToSlide(currentSlide + 1);
    resetCarouselTimer();
  });

  function resetCarouselTimer() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => goToSlide(currentSlide + 1), 6000);
  }

  resetCarouselTimer();
}

async function loadMovies() {
  const grid = document.getElementById('movie-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted)">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p style="margin-top:0.8rem;">Loading movies...</p>
    </div>
  `;

  try {
    let url = `/movies?status=${currentStatus}`;
    if (currentGenre !== 'All') url += `&genre=${encodeURIComponent(currentGenre)}`;
    if (currentLanguage !== 'All') url += `&language=${encodeURIComponent(currentLanguage)}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

    const res = await apiRequest(url);
    const movies = res.data;

    if (!movies || movies.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:4rem; color:var(--text-muted)">
          <i class="fas fa-film fa-3x" style="opacity:0.3; margin-bottom:1rem;"></i>
          <h3>No Movies Found</h3>
          <p>Try clearing your search or selecting a different filter.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';
    movies.forEach((movie) => {
      const isWishlisted = userWishlist.has(movie._id);
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <div class="movie-poster-wrap">
          <img src="${movie.posterUrl}" alt="${movie.title}" loading="lazy"/>
          <button class="btn-wishlist-toggle ${isWishlisted ? 'active' : ''}" 
                  onclick="handleWishlistToggle(event, '${movie._id}')">
            <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <div class="movie-overlay-actions">
            <a href="/pages/showtimes.html?movie=${movie._id}" class="btn btn-primary btn-sm btn-block">
              <i class="fas fa-ticket-alt"></i> Book Seats
            </a>
            <a href="/pages/movie.html?id=${movie._id}" class="btn btn-secondary btn-sm btn-block">
              View Details
            </a>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.title}</h3>
          <p class="movie-genres">${movie.genre.join(', ')}</p>
          <div class="movie-bottom-meta">
            <span class="rating-badge"><i class="fas fa-star"></i> ${movie.rating || '4.5'}</span>
            <span class="lang-badge">${movie.language} • ${movie.certification || 'UA'}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--danger)">
        <p>Failed to load movies. Make sure your server and database are active.</p>
      </div>
    `;
  }
}

async function handleWishlistToggle(event, movieId) {
  event.stopPropagation();
  if (!requireAuth()) return;

  const btn = event.currentTarget;
  const icon = btn.querySelector('i');

  try {
    const res = await apiRequest('/wishlist/toggle', {
      method: 'POST',
      body: { movieId },
    });

    if (res.data.added) {
      userWishlist.add(movieId);
      btn.classList.add('active');
      icon.className = 'fas fa-heart';
      showToast('Added to your Wishlist!', 'success');
    } else {
      userWishlist.delete(movieId);
      btn.classList.remove('active');
      icon.className = 'far fa-heart';
      showToast('Removed from Wishlist', 'info');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function setupFilterHandlers() {
  // Search input debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        searchQuery = e.target.value.trim();
        loadMovies();
      }, 350);
    });
  }

  // Genre chips
  const genreChips = document.querySelectorAll('.genre-chip');
  genreChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      genreChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentGenre = chip.dataset.genre || 'All';
      loadMovies();
    });
  });

  // Language chips
  const langChips = document.querySelectorAll('.lang-chip');
  langChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      langChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentLanguage = chip.dataset.lang || 'All';
      loadMovies();
    });
  });

  // Tab switcher (Now Showing / Coming Soon)
  const tabNow = document.getElementById('tab-now-showing');
  const tabComing = document.getElementById('tab-coming-soon');
  if (tabNow && tabComing) {
    tabNow.addEventListener('click', () => {
      tabNow.classList.add('active');
      tabComing.classList.remove('active');
      currentStatus = 'now-showing';
      loadMovies();
    });
    tabComing.addEventListener('click', () => {
      tabComing.classList.add('active');
      tabNow.classList.remove('active');
      currentStatus = 'coming-soon';
      loadMovies();
    });
  }
}
