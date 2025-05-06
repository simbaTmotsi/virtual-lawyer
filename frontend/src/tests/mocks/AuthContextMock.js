import React from 'react';
import { AuthContext } from '../../contexts/AuthContext';

// Default mock values for auth context
const defaultAuthValues = {
  user: null,
  isAuthenticated: false,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  fetchUserProfile: jest.fn(),
  checkAuthStatus: jest.fn()
};

// Authenticated user mock values
const authenticatedValues = {
  user: {
    id: 1,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'attorney',
    is_active: true
  },
  isAuthenticated: true,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  fetchUserProfile: jest.fn(),
  checkAuthStatus: jest.fn()
};

/**
 * Auth context provider that can be used in tests
 * @param {Object} props Component props
 * @param {boolean} props.authenticated Whether to mock an authenticated state
 * @param {Object} props.customValues Custom values to override defaults
 */
export const AuthContextMock = ({ 
  children, 
  authenticated = false,
  customValues = {}
}) => {
  const contextValue = authenticated 
    ? { ...authenticatedValues, ...customValues } 
    : { ...defaultAuthValues, ...customValues };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextMock;
