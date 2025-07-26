import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/staff';
    }
    return Promise.reject(error);
  }
);

// Application APIs
export const applicationAPI = {
  // Submit new application
  submitApplication: (applicationData) => {
    return api.post('/applications/', applicationData);
  },

  // Get application by reference number
  getApplicationByReference: (reference) => {
    return api.get(`/applications/reference/${reference}`);
  },

  // Get all applications (staff only)
  getAllApplications: (params = {}) => {
    return api.get('/applications/', { params });
  },

  // Get application by ID (staff only)
  getApplicationById: (id) => {
    return api.get(`/applications/${id}`);
  },

  // Update application status (staff only)
  updateApplicationStatus: (id, status, notes = '') => {
    return api.put(`/applications/${id}/status`, { status, notes });
  },

  // Add comment to application (staff only)
  addComment: (id, comment) => {
    return api.post(`/applications/${id}/comments`, { comment });
  }
};

// Authentication APIs
export const authAPI = {
  // Staff login
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Get current user info
  getCurrentUser: () => {
    return api.get('/auth/me');
  },

  // Logout
  logout: () => {
    return api.post('/auth/logout');
  }
};

// Status checking API
export const statusAPI = {
  // Check application status by reference
  checkStatus: (reference) => {
    return api.get(`/status/${reference}`);
  }
};

export default api;