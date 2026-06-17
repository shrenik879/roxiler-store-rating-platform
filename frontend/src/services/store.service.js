import api from './axios';

export const storeService = {
  async listAdmin(params) {
    const { data } = await api.get('/admin/stores', { params });
    return { items: data.data, meta: data.meta };
  },
  async create(payload) {
    const { data } = await api.post('/admin/stores', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/admin/stores/${id}`, payload);
    return data.data;
  },
  async exportCSV(params) {
    const { data } = await api.get('/admin/stores/export', { params, responseType: 'blob' });
    return data;
  },

  async browse(params) {
    const { data } = await api.get('/stores', { params });
    return { items: data.data, meta: data.meta };
  },
};
