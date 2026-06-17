import api from './axios';

export const authService = {
  async login(payload) {
    const { data } = await api.post('/auth/login', payload);
    return data.data;
  },
  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  },
  async logout() {
    await api.post('/auth/logout');
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
  async changePassword(payload) {
    const { data } = await api.put('/auth/password', payload);
    return data;
  },
};
