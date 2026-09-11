import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Authorization Bearer
api.interceptors.request.use((config) => {
  const isAdminEndpoint = config.url && (config.url.startsWith('/admin') || config.url.startsWith('admin'));
  const isAdminPath = typeof window !== 'undefined' && window.location && window.location.pathname.startsWith('/admin');

  let token = null;
  if (isAdminEndpoint || isAdminPath) {
    token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  } else {
    token = localStorage.getItem('user_token') || localStorage.getItem('token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid credentials
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        // Leave to component to handle redirect
      }
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
