import api from './axios';

export const userService = {
  async list(params) {
    const { data } = await api.get('/admin/users', { params });
    return { items: data.data, meta: data.meta };
  },
  async getById(id) {
    const { data } = await api.get(`/admin/users/${id}`);
    return data.data;
  },
  async create(payload) {
    const { data } = await api.post('/admin/users', payload);
    return data.data;
  },
  async exportCSV(params) {
    const { data } = await api.get('/admin/users/export', { params, responseType: 'blob' });
    return data;
  },
};
