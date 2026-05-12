import axios from 'axios';

const api = axios.create({ baseURL: '' });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('deepshield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Only logout if we get 401 AND there is no token at all
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const token  = localStorage.getItem('deepshield_token');

    // Only force logout if 401 AND token is missing or truly expired
    if (status === 401 && !token) {
      localStorage.removeItem('deepshield_token');
      localStorage.removeItem('deepshield_user');
      window.location.href = '/login?session=expired';
    }

    return Promise.reject(error);
  }
);

export default api;