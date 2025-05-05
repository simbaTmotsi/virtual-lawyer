/**
 * Utility function to make API requests
 * @param {string} endpoint - API endpoint (starting with /)
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} data - Request body for POST/PUT requests
 * @returns {Promise<any>} - Response data
 */
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const url = `${baseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    credentials: 'include', // For cookies if your API uses them
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const result = await response.json();
    
    if (!response.ok) {
      // Format error response
      throw { 
        status: response.status, 
        data: result,
        message: result.detail || 'An error occurred'
      };
    }
    
    return result;
  } else {
    if (!response.ok) {
      throw { 
        status: response.status, 
        data: await response.text(),
        message: 'An error occurred'
      };
    }
    
    return await response.text();
  }
};

export default apiRequest;
