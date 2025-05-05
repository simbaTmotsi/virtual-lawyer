/**
 * Helper utility for making authenticated API requests
 */

export const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const baseUrl = process.env.REACT_APP_API_URL || '';
  const url = `${baseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token to headers if it exists
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
    credentials: 'include', // For cookies if your backend uses them
  };
  
  // Add request body for POST, PUT, PATCH
  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(data);
  }
  
  console.log(`Making ${method} request to ${url}`);
  
  const response = await fetch(url, options);
  
  // Check if the response is JSON
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  // Parse response
  const responseData = isJson ? await response.json() : await response.text();
  
  // If response is not ok, throw an error
  if (!response.ok) {
    const error = new Error(response.statusText);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }
  
  return responseData;
};
