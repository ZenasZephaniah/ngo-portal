import axios from 'axios';

// Add 'http://localhost:5050/api' as a fallback if the environment variable is not picked up
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ngo-portal-j54e.onrender.com',
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