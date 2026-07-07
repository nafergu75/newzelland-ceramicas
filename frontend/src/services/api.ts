import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.patch('/user/profile', data),
  getOrders: (limit?: number, offset?: number) =>
    api.get('/user/orders', { params: { limit, offset } }),
};

export const productsAPI = {
  getProducts: () => api.get('/products'),
  getProduct: (id: string) => api.get(`/products/${id}`),
};

export const checkoutAPI = {
  createOrder: (data: any) => api.post('/checkout', data),
};

export const adminAPI = {
  getVisitStats: (days?: number) =>
    api.get('/admin/stats/visits', { params: { days } }),
  getDownloadStats: (days?: number) =>
    api.get('/admin/stats/downloads', { params: { days } }),
  getOrderStats: (days?: number) =>
    api.get('/admin/stats/orders', { params: { days } }),
  updateOrder: (orderId: string, status: string) =>
    api.patch(`/admin/orders/${orderId}`, { status }),
};

export default api;
