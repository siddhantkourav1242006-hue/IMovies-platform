import api from './api';
import { generateMockSeats } from './mockData';

const seatService = {
  async getByShow(showId) {
    try {
      const res = await api.get(`/seats/show/${showId}`);
      if (res.data?.data && res.data.data.length > 0) {
        return res;
      }
    } catch (e) {
      console.warn('Using fallback seat matrix:', e.message);
    }
    const seats = generateMockSeats(showId);
    return { data: { success: true, count: seats.length, data: seats } };
  },

  async getSeatMap(showId) {
    return this.getByShow(showId);
  },

  async lock(showId, seatIds) {
    try {
      return await api.post(`/seats/lock`, { showId, seatIds });
    } catch (e) {
      // In offline/standalone mode, accept lock
      const list = Array.isArray(seatIds) ? seatIds : [];
      return {
        data: {
          success: true,
          data: {
            lockedSeats: list.map((id) => ({
              _id: typeof id === 'object' ? `${id.row || ''}${id.number || ''}` : id,
              status: 'locked',
            })),
          },
        },
      };
    }
  },

  async lockSeats(showId, seats) {
    return this.lock(showId, seats);
  },

  async unlock(showId, seatIds) {
    try {
      return await api.post(`/seats/unlock`, { showId, seatIds });
    } catch (e) {
      return { data: { success: true } };
    }
  },

  async unlockSeats(showId, seats) {
    return this.unlock(showId, seats);
  },
};

export default seatService;
