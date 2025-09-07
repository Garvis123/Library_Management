// frontend/src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
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
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  // Authentication endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  
  // Admin endpoints
  createAdmin: (adminData) => api.post('/auth/admin/register', adminData)
};

export const booksAPI = {
  // Book endpoints
  getAllBooks: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/books${queryString ? `?${queryString}` : ''}`);
  },
  
  getAvailableBooks: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/books/available${queryString ? `?${queryString}` : ''}`);
  },
  
  getBookById: (id) => api.get(`/books/${id}`),
  
  searchBooks: (query) => api.get(`/books/search?q=${encodeURIComponent(query)}`),
  
  addBook: (bookData) => api.post('/books', bookData),
  
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  
  deleteBook: (id) => api.delete(`/books/${id}`),
  
  borrowBook: (id) => api.put(`/books/${id}/borrow`),
  
  returnBook: (id) => api.put(`/books/${id}/return`)
};

// Utility functions for common API patterns
export const apiUtils = {
  // Handle API response and extract data
  handleResponse: (response) => {
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    throw new Error(response.data.message || 'API request failed');
  },

  // Handle API errors
  handleError: (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const statusCode = error.response?.status || 500;
    
    return {
      success: false,
      error: errorMessage,
      statusCode,
      details: error.response?.data?.errors || []
    };
  },

  // Create form data for file uploads (if needed in future)
  createFormData: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return formData;
  }
};

// Export the configured axios instance
export { api };
export default api;