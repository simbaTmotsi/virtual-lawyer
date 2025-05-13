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
          throw new Error("No refresh token available");
        }
        
        // Use the correct endpoint with base URL for token refresh
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/accounts/refresh/`, 
          { refresh: refreshToken }
        );
        const { access } = response.data;
        
        localStorage.setItem('accessToken', access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh failure (usually by logging out user)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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
