import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// ✅ ADD THIS PART (API modules)

// Projects API
export const projects = {
  list: () => client.get('/projects'),
};

// Auth API (optional, useful)
export const auth = {
  login: (data) => client.post('/auth/login', data),
};

// Trees API (based on your backend)
export const trees = {
  list: () => client.get('/trees'),
};


// Keep default export if needed
export default client;