import axios from 'axios';

// Create custom instances
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',  // Make sure /api is included
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set authorization header if token exists
const token = localStorage.getItem('accessToken');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Handle token refresh properly
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, redirect to login
          console.error("No refresh token available");
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Use the correct endpoint with base URL for token refresh
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        const response = await axios.post(
          `${baseUrl}/accounts/refresh/`, 
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        const { access } = response.data;
        
        // Store the new token
        localStorage.setItem('accessToken', access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        console.log("Token refreshed successfully");
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh failure by redirecting to login
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const AuthAPI = {
  login: async (credentials) => {
    // Use the full URL with /api for login endpoint
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const apiUrl = `${baseUrl}/api/accounts/proxy-login/`;
    console.log("Login API URL:", apiUrl);
    
    const response = await axios.post(
      apiUrl,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    // Automatically set the Authorization header after login
    if (response.data.access) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    } else if (response.data.access_token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
    
    return response.data;
  },
  register: async (userData) => {
    // Ensure password2 is included in the request payload
    // If password2 isn't provided but password is, use password as password2
    const dataToSend = { ...userData };
    if (!dataToSend.password2 && dataToSend.password) {
      dataToSend.password2 = dataToSend.password;
    }
    
    try {
      // Fix the URL construction to ensure /api prefix
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      // Make sure the URL format is consistent: baseUrl + /api/accounts/register/
      const apiUrl = `${baseUrl}/api/accounts/register/`;
        
      console.log("Registration API URL:", apiUrl);
      
      const response = await axios.post(
        apiUrl,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      console.log("Registration successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Registration error status:", error.response?.status);
      console.error("Registration error details:", error.response?.data || error.message);
      throw error;
    }
  },
  getCurrentUser: async () => {
    const response = await api.get('/api/accounts/me/');
    return response.data;
  },
};

// General API request function
const apiRequest = async (endpoint, method = 'GET', data = null, isFormData = false, customHeaders = {}) => {
  try {
    console.log(`Making ${method} request to ${endpoint}`);
    
    const config = {
      method: method,
      url: endpoint,
      headers: {
        ...customHeaders
      }
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
    
    // Ensure token is set in default headers if available
    const token = localStorage.getItem('accessToken');
    if (token && !customHeaders['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('Request config:', { ...config, headers: { ...config.headers } });
    
    const response = await api(config);
    return response.data;
  } catch (error) {
    // Improve error handling and logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API request failed: ${endpoint}`, error);
      
      // Special handling for common error codes
      if (error.response.status === 403) {
        console.error(`Permission denied for endpoint: ${endpoint}. User may not have required permissions.`);
      }
      
      if (error.response.status === 401) {
        console.error(`Unauthorized access to endpoint: ${endpoint}. User may need to log in again.`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`API request received no response: ${endpoint}`, error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`API request setup error: ${endpoint}`, error.message);
    }
    
    // Re-throw the error for the calling code to handle
    throw error;
  }
};

export default apiRequest;
