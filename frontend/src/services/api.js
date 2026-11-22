import axios from 'axios';

const DEFAULT_CLOUD_API = 'https://bphc-it-helpdesk-api.onrender.com/api';

function resolveBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_CLOUD_API;
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 75000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('iitsm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Provide user-friendly errors for network timeouts and waking up cold backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      error.message = 'The cloud server took longer than expected to wake up. Please click again — it responds immediately once awake.';
    } else if (!error.response && error.message === 'Network Error') {
      error.message = 'Unable to connect to the cloud server. Please check your internet connection.';
    }
    return Promise.reject(error);
  }
);

export default api;
