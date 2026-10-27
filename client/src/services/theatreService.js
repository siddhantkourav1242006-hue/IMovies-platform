import api from './api';
import { MOCK_THEATRES } from './mockData';

const theatreService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/theatres', { params });
      if (res.data?.data && res.data.data.length > 0) return res;
    } catch (e) {}
    let list = [...MOCK_THEATRES];
    if (params.city) {
      list = list.filter((t) => t.city.toLowerCase() === params.city.toLowerCase());
    }
    return { data: { success: true, count: list.length, data: list } };
  },

  async getById(id) {
    try {
      const res = await api.get(`/theatres/${id}`);
      if (res.data?.data) return res;
    } catch (e) {}
    const t = MOCK_THEATRES.find((item) => item._id === id) || MOCK_THEATRES[0];
    return { data: { success: true, data: t } };
  },

  create(data) {
    return api.post('/theatres', data);
  },
  update(id, data) {
    return api.put(`/theatres/${id}`, data);
  },
  delete(id) {
    return api.delete(`/theatres/${id}`);
  },
};

export default theatreService;
