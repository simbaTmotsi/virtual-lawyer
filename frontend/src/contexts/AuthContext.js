import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { AuthAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Use a ref instead of state to avoid dependency issues
  const lastSuccessfulCheckRef = useRef(0);

  // Memoize checkAuthStatus with useCallback and properly include user in dependencies
  const checkAuthStatus = useCallback(async (force = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      // Check if we have a recent auth check (within last 60 seconds) and user data
      // Skip the API call unless force=true
      const now = Date.now();
      if (!force && user && (now - lastSuccessfulCheckRef.current < 60000)) {
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      }

      // Verify token with the backend using AuthAPI
      const userData = await AuthAPI.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      lastSuccessfulCheckRef.current = now;
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      // Invalid token, clear storage
      localStorage.removeItem('token');
      // Ensure state reflects logged-out status
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]); // Include user in the dependency array

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      // Use AuthAPI.login
      const response = await AuthAPI.login({ email, password });
      
      // Store the token - handle different response formats
      if (response.access) {
        // New format (JWT)
        localStorage.setItem('token', response.access);
        
        // If the response includes user data, set it directly
        if (response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
          return response.user;
        }
      } else if (response.token) {
        // Old format
        localStorage.setItem('token', response.token);
        
        if (response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
          return response.user;
        }
      } else {
        throw new Error('No token received from server');
      }
      
      // Otherwise, fetch user data
      return await checkAuthStatus();
    } catch (error) {
      console.error('Login error:', error);
      // Clear any potentially stale token on login failure
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      // Re-throw the error so the Login component can catch it
      throw error; 
    }
  };

  const register = async (userData) => {
    try {
      // Use AuthAPI.register
      const response = await AuthAPI.register(userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Use AuthAPI.logout
      await AuthAPI.logout();
    } catch (error) {
      // Log error but proceed with frontend logout regardless
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and reset state
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userData = await AuthAPI.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  // Provide auth context values
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    fetchUserProfile,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
