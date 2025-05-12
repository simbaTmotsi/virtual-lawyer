/**
 * Helper utility for making authenticated API requests
 */

export const apiRequest = async (endpoint, method = 'GET', data = null, customConfig = {}) => {
  const API_BASE_URL = '';  // Base URL is empty for relative URLs
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add Authorization header if token exists
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Prepare the config
  const config = {
    method,
    headers: {
      ...headers,
      ...customConfig.headers
    },
    ...customConfig
  };
  
  // Add request body for POST, PUT, PATCH
  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    if (data instanceof FormData) {
      // If FormData is passed, don't stringify it and remove Content-Type to let browser set it
      config.body = data;
      delete config.headers['Content-Type'];
    } else {
      config.body = JSON.stringify(data);
    }
  }
  
  try {
    const response = await fetch(url, config);
    
    // Handle no content responses
    if (response.status === 204) {
      return null;
    }
    
    // Try to parse as JSON, but handle non-JSON responses as well
    const responseData = await response.text();
    const data = responseData ? JSON.parse(responseData) : {};
    
    // Handle error responses
    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        response: data
      };
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Create convenience methods for common HTTP verbs
const api = {
  get: (endpoint, customConfig = {}) => apiRequest(endpoint, 'GET', null, customConfig),
  post: (endpoint, data, customConfig = {}) => apiRequest(endpoint, 'POST', data, customConfig),
  put: (endpoint, data, customConfig = {}) => apiRequest(endpoint, 'PUT', data, customConfig),
  patch: (endpoint, data, customConfig = {}) => apiRequest(endpoint, 'PATCH', data, customConfig),
  delete: (endpoint, customConfig = {}) => apiRequest(endpoint, 'DELETE', null, customConfig)
};

export default api;
