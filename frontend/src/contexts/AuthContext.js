import React, { createContext, useContext, useState, useEffect } from 'react';
// Import AuthAPI from the correct file 'api.js'
import { AuthAPI } from '../utils/api'; // Corrected import path

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with the backend using AuthAPI
      const userData = await AuthAPI.getCurrentUser(); // Use AuthAPI method
      console.log('User data retrieved:', userData);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token validation failed:', error);
      // Invalid token, clear storage
      localStorage.removeItem('token');
      // Ensure state reflects logged-out status
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Use AuthAPI.login
      const response = await AuthAPI.login({ email, password });
      // Store the JWT token (assuming response structure)
      // Adjust based on your actual API response for login
      if (response && response.access) {
        localStorage.setItem('token', response.access);
        // Optionally store refresh token if provided: localStorage.setItem('refreshToken', response.refresh);
        
        // Fetch user data after successful login
        await checkAuthStatus(); // Re-use checkAuthStatus to fetch and set user
        
        // Return response for potential further handling in component
        return response; 
      } else {
         // Handle cases where login response doesn't contain expected tokens
         throw new Error('Login response did not contain expected tokens.');
      }

    } catch (error) {
      console.error('Login error:', error);
      // Clear any potentially stale token on login failure
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      // Use AuthAPI.register
      const response = await AuthAPI.register(userData);
      // Optionally handle response, e.g., auto-login or confirmation message
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Use AuthAPI.logout
      // Pass refresh token if your backend requires it for logout
      // const refreshToken = localStorage.getItem('refreshToken');
      // await AuthAPI.logout({ refresh: refreshToken }); // Example if refresh token needed
      await AuthAPI.logout();
    } catch (error) {
      // Log error but proceed with frontend logout regardless
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens and user state on frontend
      localStorage.removeItem('token');
      // localStorage.removeItem('refreshToken'); // If using refresh tokens
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  
  // Function to fetch user profile manually if needed (e.g., for debugger)
  const fetchUserProfile = async () => {
     setLoading(true);
     await checkAuthStatus();
  };


  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    fetchUserProfile, // Expose fetchUserProfile if needed elsewhere
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
