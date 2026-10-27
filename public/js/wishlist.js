// Wishlist Management Page Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  loadWishlistMovies();
});

async function loadWishlistMovies() {
  const grid = document.getElementById('wishlist-grid');
  const countEl = document.getElementById('wishlist-count');

  try {
    const res = await apiRequest('/wishlist');
    const movies = res.data.movies || [];

    if (countEl) countEl.innerText = `${movies.length} Saved Movie${movies.length !== 1 ? 's' : ''}`;

    if (movies.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:4rem; color:var(--text-muted)">
          <i class="far fa-heart fa-3x" style="opacity:0.3; margin-bottom:1rem;"></i>
          <h3>Your Wishlist is Empty</h3>
          <p>Explore our trending movies and tap the heart icon to save them for later.</p>
          <a href="/" class="btn btn-primary" style="margin-top:1.5rem;">Browse Movies</a>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';
    movies.forEach((movie) => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <div class="movie-poster-wrap">
          <img src="${movie.posterUrl}" alt="${movie.title}"/>
          <button class="btn-wishlist-toggle active" onclick="removeWishlistMovie(event, '${movie._id}')">
            <i class="fas fa-heart"></i>
          </button>
          <div class="movie-overlay-actions">
            <a href="/pages/showtimes.html?movie=${movie._id}" class="btn btn-primary btn-sm btn-block">
              <i class="fas fa-ticket-alt"></i> Book Seats
            </a>
            <a href="/pages/movie.html?id=${movie._id}" class="btn btn-secondary btn-sm btn-block">
              Details
            </a>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.title}</h3>
          <p class="movie-genres">${movie.genre.join(', ')}</p>
          <div class="movie-bottom-meta">
            <span class="rating-badge"><i class="fas fa-star"></i> ${movie.rating || '4.5'}</span>
            <span class="lang-badge">${movie.language}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--danger)">Failed to load wishlist</p>`;
  }
}

window.removeWishlistMovie = async function (e, movieId) {
  e.stopPropagation();
  try {
    await apiRequest('/wishlist/toggle', {
      method: 'POST',
      body: { movieId },
    });
    showToast('Movie removed from your wishlist', 'info');
    loadWishlistMovies();
  } catch (err) {
    showToast(err.message, 'error');
  }
};
