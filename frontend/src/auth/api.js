import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || '' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('deepshield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const token  = localStorage.getItem('deepshield_token');
    if (status === 401 && !token) {
      localStorage.removeItem('deepshield_token');
      localStorage.removeItem('deepshield_user');
      window.location.href = '/login?session=expired';
    }
    return Promise.reject(error);
  }
);

export default api;
