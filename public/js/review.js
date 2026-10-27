// Movie User Reviews & Ratings Sub-system
let activeMovieId = null;

window.loadReviewsForMovie = async function (movieId) {
  activeMovieId = movieId;
  const listContainer = document.getElementById('reviews-list');
  const avgRatingEl = document.getElementById('reviews-avg-rating');

  if (!listContainer) return;

  try {
    const res = await apiRequest(`/reviews/movie/${movieId}`);
    const reviews = res.data;

    if (!reviews || reviews.length === 0) {
      listContainer.innerHTML = `<p style="color:var(--text-muted); padding:1rem 0;">No reviews yet. Be the first to share your thoughts!</p>`;
      return;
    }

    listContainer.innerHTML = reviews
      .map(
        (r) => `
      <div style="background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-sm); padding:1.2rem; margin-bottom:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div class="user-avatar" style="width:30px; height:30px; font-size:0.8rem;">
              ${r.user.name ? r.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style="font-weight:600; color:#fff;">${r.user.name}</span>
          </div>
          <div style="color:var(--warning); font-size:0.85rem;">
            ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
          </div>
        </div>
        <p style="color:var(--text-secondary); font-size:0.95rem; line-height:1.5;">${r.comment}</p>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">${formatDateDisplay(r.createdAt)}</div>
      </div>
    `
      )
      .join('');
  } catch (err) {}

  setupReviewForm();
};

function setupReviewForm() {
  const form = document.getElementById('review-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;

    const rating = document.getElementById('review-rating-select').value;
    const comment = document.getElementById('review-comment-input').value.trim();

    try {
      await apiRequest('/reviews', {
        method: 'POST',
        body: { movieId: activeMovieId, rating: Number(rating), comment },
      });

      showToast('Thank you! Your review has been posted.', 'success');
      form.reset();
      window.loadReviewsForMovie(activeMovieId);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
