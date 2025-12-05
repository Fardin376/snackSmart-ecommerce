// frontend/src/services/axiosInstance.js
import axios from 'axios';

// real backend URL on Cloud Run:
const FALLBACK_API_URL = 'https://snacksmart-api-445738662856.us-central1.run.app';

// Try to read from Vite env, otherwise use fallback
const API_URL =  FALLBACK_API_URL


console.log('API_URL used by axios:', API_URL);

const axiosInstance = axios.create({
  // Backend Express mounts routes under /api, so this becomes /api/products, etc.
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
