import api from './api';
import { generateMockShows, MOCK_MOVIES, MOCK_THEATRES } from './mockData';

const showService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/shows', { params });
      if (res.data?.data && res.data.data.length > 0) {
        return res;
      }
    } catch (e) {
      console.warn('Using fallback showtimes:', e.message);
    }
    const shows = generateMockShows(params.movieId, params.city, params.date);
    return { data: { success: true, count: shows.length, data: shows } };
  },

  async getByMovie(movieId, params = {}) {
    return this.getAll({ movieId, ...params });
  },

  async getById(showId) {
    try {
      const res = await api.get(`/shows/${showId}`);
      if (res.data?.data) return res;
    } catch (e) {}

    let targetMovieId = null;
    let targetTheatreId = null;
    if (showId && typeof showId === 'string' && showId.startsWith('show_')) {
      const parts = showId.split('_');
      targetMovieId = parts[1];
      targetTheatreId = parts[2];
    }

    const shows = generateMockShows(targetMovieId, 'Mumbai');
    let show = shows.find((s) => s._id === showId) || shows[0];

    const movieObj =
      (show?.movieId && typeof show.movieId === 'object' ? show.movieId : null) ||
      MOCK_MOVIES.find((m) => m._id === (show?.movieId || targetMovieId)) ||
      MOCK_MOVIES[0];

    const theatreObj =
      (show?.theatreId && typeof show.theatreId === 'object' ? show.theatreId : null) ||
      MOCK_THEATRES.find((t) => t._id === (show?.theatreId || targetTheatreId)) ||
      MOCK_THEATRES[0];

    return {
      data: {
        success: true,
        data: {
          ...show,
          movieId: movieObj,
          theatreId: theatreObj,
        },
      },
    };
  },

  create(data) {
    return api.post('/shows', data);
  },
  update(id, data) {
    return api.put(`/shows/${id}`, data);
  },
  delete(id) {
    return api.delete(`/shows/${id}`);
  },
};

export default showService;
