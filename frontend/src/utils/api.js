/**
 * API request utility for making authenticated requests
 */

// Base API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Set default headers if not provided
    if (!options.headers) {
      options.headers = {
        'Content-Type': 'application/json',
      };
    }

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('API Request:', options.method || 'GET', endpoint);
    console.log('Request options:', options);

    // Make the fetch request
    const response = await fetch(endpoint.startsWith('http') ? endpoint : `${process.env.REACT_APP_API_URL || ''}${endpoint}`, options);
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // Parse response data based on content type
    let data;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle unsuccessful responses
    if (!response.ok) {
      console.log('API request failed:', response.status, response.statusText);
      console.log('Response data:', data);
      
      // For 500 errors, we may need to add more specific handling
      if (response.status === 500) {
        console.log('Server error detected. Check server logs for more details.');
      }
      
      // Fix: Create a proper Error object instead of throwing a plain object
      const apiError = new Error(`API Error: ${response.status}`);
      apiError.status = response.status;
      apiError.data = data;
      throw apiError;
    }

    return data;
  } catch (error) {
    // Log the error for debugging
    console.error('API request failed:', error);
    
    // If it's already our formatted error, just rethrow it
    if (error && error.status) {
      throw error;
    }
    
    // Fix: Create a proper Error object instead of throwing a plain object
    const networkError = new Error(`Network Error: ${error.message || 'Unable to connect to server'}`);
    networkError.status = 0;
    networkError.data = null;
    throw networkError;
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
