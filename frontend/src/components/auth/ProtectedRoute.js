import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Add admin check if required
  if (adminOnly && user?.role !== 'admin') {
     // Redirect non-admins away from admin routes
     // Or show an 'Unauthorized' page
     return <Navigate to="/" replace />;
  }


  return children;
};

export default ProtectedRoute;
