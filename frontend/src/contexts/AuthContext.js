import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI } from '../utils/api';
import { debugAuthIssues } from '../utils/tokenDebugger';

// Create Auth Context
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the user is logged in on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to verify token and get current user
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLoading(false);
      return false;
    }

    try {
      // Get current user with the stored token
      const userData = await AuthAPI.getCurrentUser();
      setCurrentUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Auth status check failed:', error);
      localStorage.removeItem('token'); // Clear invalid token
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await AuthAPI.login(credentials);
      
      // Store token and user data
      localStorage.setItem('token', response.access); // Store as 'token' consistently
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      
      // For debugging
      console.log('Login successful, token stored');
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout regardless of API success
    }
    
    localStorage.removeItem('token');
    localStorage.setItem('just_logged_out', 'true'); // Flag to prevent immediate auth check
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Clear flag after a short delay
    setTimeout(() => {
      localStorage.removeItem('just_logged_out');
    }, 3000);
  };

  // Debug authentication issues
  const debugAuth = () => {
    return debugAuthIssues();
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkAuthStatus,
    debugAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
