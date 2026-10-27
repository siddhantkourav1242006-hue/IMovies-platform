import api from './api';

const favoriteService = {
  async getAll() {
    try {
      const res = await api.get('/favorites');
      if (res.data?.data) return res;
    } catch (_) {}
    const local = JSON.parse(localStorage.getItem('imovies_user_favorites') || '[]');
    return { data: { success: true, count: local.length, data: local } };
  },

  async getFavorites() {
    return this.getAll();
  },

  async add(movieId) {
    try {
      return await api.post('/favorites', { movieId });
    } catch (_) {
      const local = JSON.parse(localStorage.getItem('imovies_user_favorites') || '[]');
      const id = typeof movieId === 'object' ? movieId._id : movieId;
      if (!local.some((item) => (item.movieId?._id || item.movieId || item._id) === id)) {
        local.push({ _id: 'fav_' + id, movieId });
        localStorage.setItem('imovies_user_favorites', JSON.stringify(local));
      }
      return { data: { success: true, message: 'Added to favorites' } };
    }
  },

  async addFavorite(movieId) {
    return this.add(movieId);
  },

  async remove(movieId) {
    try {
      return await api.delete(`/favorites/${movieId}`);
    } catch (_) {
      const local = JSON.parse(localStorage.getItem('imovies_user_favorites') || '[]');
      const id = typeof movieId === 'object' ? movieId._id : movieId;
      const filtered = local.filter((item) => (item.movieId?._id || item.movieId || item._id) !== id);
      localStorage.setItem('imovies_user_favorites', JSON.stringify(filtered));
      return { data: { success: true, message: 'Removed from favorites' } };
    }
  },

  async removeFavorite(movieId) {
    return this.remove(movieId);
  },

  async check(movieId) {
    try {
      return await api.get(`/favorites/check/${movieId}`);
    } catch (_) {
      const local = JSON.parse(localStorage.getItem('imovies_user_favorites') || '[]');
      const id = typeof movieId === 'object' ? movieId._id : movieId;
      const isFav = local.some((item) => (item.movieId?._id || item.movieId || item._id) === id);
      return { data: { success: true, isFavorite: isFav } };
    }
  },
};

export default favoriteService;
