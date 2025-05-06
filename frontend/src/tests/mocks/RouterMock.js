import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import AuthContextMock from './AuthContextMock';

/**
 * Component that provides both Router and Auth context for testing
 */
const RouterWithAuthMock = ({ 
  children, 
  initialEntries = ['/'], 
  authenticated = false,
  authValues = {}
}) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthContextMock authenticated={authenticated} customValues={authValues}>
        {children}
      </AuthContextMock>
    </MemoryRouter>
  );
};

export default RouterWithAuthMock;
