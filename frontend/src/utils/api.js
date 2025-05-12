/**
 * API request utility for making authenticated requests
 */

// Modify your apiRequest function to better handle and debug responses
const apiRequest = async (endpoint, method = 'GET', data = null, config = {}) => {
  try {
    const url = `${process.env.REACT_APP_API_URL || ''}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    // Add auth token if available - FIX: use consistent token name 'token'
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      ...config
    };

    if (data && method !== 'GET') {
      // Don't set body for FormData
      if (!(data instanceof FormData)) {
        options.body = JSON.stringify(data);
      } else {
        // For FormData, remove Content-Type so browser sets it with boundary
        delete options.headers['Content-Type'];
        options.body = data;
      }
    }

    console.log(`API Request: ${method} ${url}`, options);
    
    const response = await fetch(url, options);
    console.log(`API Response status:`, response.status);
    
    // Clone the response for logging
    const responseClone = response.clone();
    
    try {
      const responseText = await responseClone.text();
      console.log('API Response text:', responseText);
      
      // Try parsing as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log('Response is not JSON:', e);
        // Return the text if not JSON
        return responseText;
      }
      
      // If we got JSON, check for error status
      if (!response.ok) {
        throw { status: response.status, data: responseData };
      }
      
      return responseData;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw parseError;
    }
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
      return await apiRequest('/api/accounts/proxy-login/', 'POST', credentials);
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  // Register
  register: async (userData) => {
    try {
      return await apiRequest('/api/accounts/register/', 'POST', userData);
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
      return await apiRequest('/api/accounts/logout/', 'POST');
    } catch (error) {
      console.error('Logout API error:', error);
      // Still clear token even if logout API fails
      localStorage.removeItem('token');
      throw error;
    }
  }
};

export default apiRequest;
