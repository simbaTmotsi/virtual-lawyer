/**
 * API utility functions for making HTTP requests
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Make an API request
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} data - Request body for POST/PUT requests
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} Response data
 */
export const apiRequest = async (endpoint, method = 'GET', data = null, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    fetchOptions.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add request body for POST/PUT requests
  if (data && (method === 'POST' || method === 'PUT')) {
    fetchOptions.body = JSON.stringify(data);
  }
  
  try {
    console.group(`API Request: ${method} ${endpoint}`);
    console.log('Request options:', fetchOptions);
    
    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // Parse response
    const responseData = isJson ? await response.json() : await response.text();
    
    // If response is not ok, throw an error
    if (!response.ok) {
      // Include status and data in the error object
      const error = new Error(`API Error: ${response.status}`); // Keep a general message
      error.status = response.status;
      error.data = responseData; // Attach the parsed response data
      console.error('API request failed:', error, 'Response data:', responseData); // Log data here too
      console.groupEnd();
      throw error; // Re-throw the enhanced error
    }
    
    console.log('API request successful:', responseData);
    console.groupEnd();
    
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    console.groupEnd();
    throw error; // Re-throw the error to be handled by the component
  }
};

/**
 * Authentication-related API requests
 */
export const AuthAPI = {
  register: (userData) => apiRequest('/api/auth/register/', 'POST', userData), // Corrected path prefix
  login: (credentials) => apiRequest('/api/auth/login/', 'POST', credentials), // Corrected path prefix
  logout: () => apiRequest('/api/auth/logout/', 'POST'), // Corrected path prefix
  refreshToken: (refreshToken) => apiRequest('/api/auth/token/refresh/', 'POST', { refresh: refreshToken }), // Keep /api/ prefix
  forgotPassword: (email) => apiRequest('/api/auth/password-reset/', 'POST', { email }), // Keep /api/ prefix
  resetPassword: (token, password) => apiRequest('/api/auth/password-reset/confirm/', 'POST', { token, password }), // Keep /api/ prefix
  // Assuming the backend endpoint for the current user is under accounts app
  getCurrentUser: () => apiRequest('/api/accounts/users/me/', 'GET'), // Keep /api/accounts/ prefix
};

export default apiRequest;
