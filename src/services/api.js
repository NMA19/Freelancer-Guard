import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login or reload page
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getProfile: () => API.get('/auth/me'),
  updateProfile: (userData) => API.put('/auth/profile', userData),
};

// Experiences API
export const experiencesAPI = {
  getAll: (params = {}) => API.get('/experiences', { params }),
  getById: (id) => API.get(`/experiences/${id}`),
  create: (experienceData) => API.post('/experiences', experienceData),
  vote: (id, voteType) => API.put(`/experiences/${id}/vote`, { voteType }),
};

// Health check
export const healthAPI = {
  check: () => API.get('/health'),
  status: () => API.get('/'),
};

export default API;
