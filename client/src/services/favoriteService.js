import api from './api';

const favoriteService = {
  getAll() {
    return api.get('/favorites');
  },
  add(movieId) {
    return api.post('/favorites', { movieId });
  },
  remove(movieId) {
    return api.delete(`/favorites/${movieId}`);
  },
  check(movieId) {
    return api.get(`/favorites/check/${movieId}`);
  },
};

export default favoriteService;
