import api from './axios';

export const ratingService = {
  async submit(storeId, rating) {
    const { data } = await api.post(`/stores/${storeId}/rating`, { rating });
    return data.data;
  },
  async update(storeId, rating) {
    const { data } = await api.put(`/stores/${storeId}/rating`, { rating });
    return data.data;
  },
  async upsert(storeId, rating, hasExisting) {
    return hasExisting ? this.update(storeId, rating) : this.submit(storeId, rating);
  },
};
