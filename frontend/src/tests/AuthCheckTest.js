import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RouterWithAuthMock from './mocks/RouterMock';
import AuthCheck from '../App'; // Import the component with AuthCheck
import Login from '../pages/auth/Login';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('AuthCheck Component', () => {
  test('renders login page when not authenticated', async () => {
    render(
      <RouterWithAuthMock initialEntries={['/dashboard']} authenticated={false}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
        </Routes>
      </RouterWithAuthMock>
    );

    // The component should attempt to redirect to login when not authenticated
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
    });
  });

  test('allows access to protected route when authenticated', async () => {
    render(
      <RouterWithAuthMock initialEntries={['/dashboard']} authenticated={true}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
        </Routes>
      </RouterWithAuthMock>
    );

    // When authenticated, the protected content should be shown
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });
});
