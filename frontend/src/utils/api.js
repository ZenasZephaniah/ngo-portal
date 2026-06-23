import axios from 'axios';

// Append /api to the end of your Render domain
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ngo-portal-j54e.onrender.com/api',
});

// Request interceptor: Automatically add JWT token to headers if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;