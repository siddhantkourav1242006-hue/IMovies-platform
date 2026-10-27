import api from './api';

const reviewService = {
  getByMovie(movieId) {
    return api.get(`/reviews/movie/${movieId}`);
  },
  create(data) {
    return api.post('/reviews', data);
  },
  getAdminReviews() {
    return api.get('/reviews/admin');
  },
  moderate(id, status) {
    return api.put(`/reviews/admin/${id}`, { status });
  },
};

export default reviewService;
