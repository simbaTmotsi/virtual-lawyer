import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthAPI, api } from '../utils/api';
import axios from 'axios';

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
          // Set the token in the API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is valid
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp > currentTime) {
            try {
              // Token is valid, fetch current user info
              const userResponse = await AuthAPI.getCurrentUser();
              setUser(userResponse);
              setIsAuthenticated(true);
            } catch (error) {
              // Error fetching user info
              console.error('Error fetching user data:', error);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            // Token expired, clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Invalid token, clear local storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          delete api.defaults.headers.common['Authorization'];
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
      // Update the URL to match backend routes - use accounts/proxy-login/ instead of auth/login/
      const response = await AuthAPI.login({ email, password });
      
      // Store tokens in localStorage - handle both formats that might be returned from the backend
      if (response.access) {
        localStorage.setItem('accessToken', response.access);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.access}`;
      } else if (response.access_token) {
        localStorage.setItem('accessToken', response.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
      }
      
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      setAccessToken(response.access || response.access_token);
      setUser(response.user || null);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Registration function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // Ensure userData has password2 for the API
      const dataToSend = { ...userData };
      if (!dataToSend.password2 && dataToSend.password) {
        dataToSend.password2 = dataToSend.password;
      }
      
      console.log("Sending registration data to API:", dataToSend);
      
      // Fix the URL construction to ensure proper API prefix
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      // Make sure the URL format is consistent with the API endpoint
      const apiUrl = `${baseUrl}/api/accounts/register/`;
      
      console.log("Registration API URL:", apiUrl);
      
      const response = await axios.post(
        apiUrl,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log("Registration successful:", response.data);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Improve error handling to extract meaningful error messages
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle detailed error messages from Django
          console.error('API Error Response:', errorData);
        }
        if (errorData.detail) {
          throw errorData;
        }
      }
      
      throw error;
    } finally {
      setIsLoading(false);
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
