import React, { createContext, useState, useEffect, useContext } from 'react';
import apiRequest from '../utils/api';

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

      // Verify token with the backend
      const userData = await apiRequest('/api/accounts/user/', 'GET');
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      // Invalid token, clear storage
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    // Make sure this endpoint matches your backend's login endpoint
    const response = await apiRequest('/api/accounts/login/', 'POST', {
      email,
      password,
    });

    // Save token after successful login
    if (response.token) {
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
    }
    return response;
  };

  const register = async (userData) => {
    // Make sure this endpoint matches your backend's registration endpoint
    const response = await apiRequest('/api/accounts/register/', 'POST', userData);
    return response;
  };

  const logout = async () => {
    try {
      // Optionally call logout endpoint
      await apiRequest('/api/accounts/logout/', 'POST');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear regardless of backend response
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
