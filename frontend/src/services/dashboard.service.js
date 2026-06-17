import api from './axios';

export const dashboardService = {
  async adminStats() {
    const { data } = await api.get('/admin/dashboard');
    return data.data;
  },
};

export const ownerService = {
  async dashboard() {
    const { data } = await api.get('/owner/dashboard');
    return data.data;
  },
  async raters(params) {
    const { data } = await api.get('/owner/raters', { params });
    return { items: data.data, meta: data.meta };
  },
  async exportRaters() {
    const { data } = await api.get('/owner/raters/export', { responseType: 'blob' });
    return data;
  },
};
