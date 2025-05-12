import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthAPI, api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          // Verify token is valid
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp > currentTime) {
            // Token is valid, fetch current user info
            const userResponse = await AuthAPI.getCurrentUser();
            setUser(userResponse);
            setIsAuthenticated(true);
          } else {
            // Token expired, clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Invalid token, clear local storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async ({ email, password }) => {
    try {
      setIsLoading(true);
      const response = await AuthAPI.login({ email, password });
      
      // Store tokens in localStorage - handle both formats that might be returned from the backend
      if (response.access) {
        localStorage.setItem('accessToken', response.access);
      } else if (response.access_token) {
        localStorage.setItem('accessToken', response.access_token);
      }
      
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      setAccessToken(response.access || response.access_token);
      setUser(response.user || null);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Registration function
  const register = async (userData) => {
    try {
      // Ensure userData has password2 for the API
      if (!userData.password2 && userData.password) {
        userData = { ...userData, password2: userData.password };
      }
      
      const response = await AuthAPI.register(userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const isAdmin = user && user.role === 'admin';

  const value = {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    logout,
    register,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
