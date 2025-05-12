import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post('/api/auth/refresh/', { refresh: refreshToken });
        const { access } = response.data;
        
        localStorage.setItem('accessToken', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// AuthAPI methods for authentication operations
export const AuthAPI = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login/', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/api/auth/register/', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/api/accounts/me/');
    return response.data;
  },
  
  logout: async () => {
    await api.post('/api/auth/logout/');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// General API request function
const apiRequest = async (endpoint, method = 'GET', data = null, isFormData = false) => {
  try {
    const config = {
      method: method,
      url: endpoint,
    };
    
    if (data) {
      if (isFormData) {
        config.data = data;
        config.headers = {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        };
      } else {
        config.data = data;
      }
    }
    
    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

export default apiRequest;
