import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 25000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartstudy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('smartstudy_token');
        localStorage.removeItem('smartstudy_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
