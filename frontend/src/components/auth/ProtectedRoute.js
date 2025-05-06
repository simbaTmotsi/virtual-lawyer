import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading, checkAuthStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const authCheckPerformedRef = useRef(false);

  useEffect(() => {
    // Only attempt to verify token if we're not already authenticated and not currently loading
    // and haven't already performed a check on this render cycle
    if (!loading && !isAuthenticated && !authCheckPerformedRef.current) {
      // Add a debounce mechanism using localStorage to prevent multiple simultaneous checks
      const lastCheck = localStorage.getItem('auth_last_check');
      const now = Date.now();
      const justLoggedOut = localStorage.getItem('just_logged_out');
      
      // Skip check if user just logged out
      if (justLoggedOut) {
        authCheckPerformedRef.current = true;
        return;
      }
      
      // Only check if more than 5 seconds have passed since last check
      if (!lastCheck || (now - parseInt(lastCheck)) > 5000) {
        localStorage.setItem('auth_last_check', now.toString());
        authCheckPerformedRef.current = true;
        
        const verify = async () => {
          const isValid = await checkAuthStatus();
          if (!isValid) {
            // If not valid and we need authentication, redirect to login
            navigate('/login', { state: { from: location }, replace: true });
          }
        };
        
        verify();
      }
    }
  }, [isAuthenticated, loading, checkAuthStatus, navigate, location]);

  if (loading) {
    // Return loading indicator
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Clear any potential logout flag before redirecting
    localStorage.removeItem('just_logged_out');
    // If auth check is complete and user is not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // If admin-only route but user is not admin, redirect to dashboard
    return <Navigate to="/" replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
