/**
 * API request utility for making authenticated requests
 */

// Base API request function
export const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = process.env.REACT_APP_API_URL || '';
  const url = `${baseUrl}${endpoint}`;
  
  // Changed from 'authToken' to 'token' to match what's used in AuthContext
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    
    // Check if the response is empty or not JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {};
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API endpoints
export const AuthAPI = {
  // Login
  login: async (credentials) => {
    try {
      return await apiRequest('/api/accounts/proxy-login/', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  // Register
  register: async (userData) => {
    try {
      return await apiRequest('/api/accounts/register/', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      return await apiRequest('/api/accounts/me/');
    } catch (error) {
      console.error('Get current user API error:', error);
      throw error;
    }
  },
  
  // Logout
  logout: async () => {
    try {
      return await apiRequest('/api/accounts/logout/', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Still clear token even if logout API fails
      localStorage.removeItem('token');
      throw error;
    }
  }
};

// Export the base request function as default
export default apiRequest;
