import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const register = async (userData) => {
  // Make sure the URL has the /api prefix
  const apiUrl = `${API_URL}/api/accounts/register/`;
  console.log('Attempting registration with endpoint:', apiUrl);
  console.log('Registration data:', userData);
  
  // Add a check to ensure API_URL contains /api
  if (!API_URL.includes('/api')) {
    console.warn('Warning: API_URL may not include /api prefix:', API_URL);
  }
  
  try {
    const response = await axios.post(
      apiUrl, 
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Better error handling to display the actual error from the backend
    if (error.response && error.response.data) {
      throw error.response.data;
    } else if (error.response) {
      // If no response data but have status
      throw { detail: `Server error: ${error.response.status}` };
    } else if (error.request) {
      // Request was made but no response received (network error)
      throw { detail: 'No response from server. Please check your connection.' };
    }
    throw error;
  }
};

// Add login function for consistency
export const login = async (credentials) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/accounts/proxy-login/`, 
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};