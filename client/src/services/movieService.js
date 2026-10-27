import api from './api';
import { MOCK_MOVIES } from './mockData';

const movieService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/movies', { params });
      if (res.data?.data && res.data.data.length > 0) {
        return res;
      }
    } catch (e) {
      console.warn('Using fallback movie catalog:', e.message);
    }

    // Apply client-side filters
    let list = [...MOCK_MOVIES];
    if (params.city) {
      list = list.filter(
        (m) => !m.cities || m.cities.some((c) => c.toLowerCase() === params.city.toLowerCase())
      );
    }
    if (params.genre && params.genre !== 'All') {
      list = list.filter(
        (m) => m.genre && m.genre.some((g) => g.toLowerCase() === params.genre.toLowerCase())
      );
    }
    if (params.language && params.language !== 'All') {
      list = list.filter(
        (m) => m.language && m.language.toLowerCase() === params.language.toLowerCase()
      );
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (m) => m.title.toLowerCase().includes(q) || (m.synopsis && m.synopsis.toLowerCase().includes(q))
      );
    }

    return { data: { success: true, count: list.length, data: list } };
  },

  async getBySlug(slug) {
    try {
      const res = await api.get(`/movies/${slug}`);
      if (res.data?.data) return res;
    } catch (e) {}
    const found = MOCK_MOVIES.find((m) => m.slug === slug || m._id === slug) || MOCK_MOVIES[0];
    return { data: { success: true, data: found } };
  },

  async getFeatured() {
    try {
      const res = await api.get('/movies/featured');
      if (res.data?.data && (Array.isArray(res.data.data) ? res.data.data.length > 0 : true)) {
        return res;
      }
    } catch (e) {}
    const featured = MOCK_MOVIES.filter((m) => m.featured);
    return { data: { success: true, data: featured } };
  },

  getNowShowing(city, params) {
    return this.getAll({ city, status: 'now_showing', ...params });
  },

  getGenres() {
    return Promise.resolve({
      data: {
        success: true,
        data: ['All', 'Action', 'Adventure', 'Drama', 'Sci-Fi', 'Thriller', 'History', 'Romance'],
      },
    });
  },

  create(data) {
    return api.post('/movies', data);
  },

  update(id, data) {
    return api.put(`/movies/${id}`, data);
  },

  delete(id) {
    return api.delete(`/movies/${id}`);
  },
};

export default movieService;
