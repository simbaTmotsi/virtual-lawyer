import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/apiHelper';

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
      const userData = await apiRequest('/api/accounts/user/');
      console.log('User data retrieved:', userData);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token validation failed:', error);
      // Invalid token, clear storage
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Update to use FastAPI endpoint
      const response = await apiRequest('/auth/login', 'POST', {
        email,
        password,
      });
      
      console.log('Login response:', response);
      
      // Save token after successful login
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('No token received from server');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    // Use the FastAPI endpoint instead of the Django one
    const response = await apiRequest('/auth/register', 'POST', userData);
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
