import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    // If token exists, add to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
        
        const response = await axios.post('/auth/refresh/', { refresh: refreshToken });
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

// Auth API endpoints
export const AuthAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => {
    // Ensure password2 is included for FastAPI validation
    if (!userData.password2 && userData.password) {
      userData = { ...userData, password2: userData.password };
    }
    return api.post('/auth/register/', userData);
  },
  refreshToken: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  getCurrentUser: () => api.get('/accounts/me/'),
  logout: async () => {
    await api.post('/auth/logout/');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
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
export { api };
