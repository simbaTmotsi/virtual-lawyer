import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout components
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard pages
import Dashboard from './pages/Dashboard';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import LlmIntegration from './pages/admin/LlmIntegration';
import SystemSettings from './pages/admin/SystemSettings';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

// Client management
import ClientsList from './pages/clients/ClientsList';
import ClientDetails from './pages/clients/ClientDetails';
import NewClient from './pages/clients/NewClient';

// Case management
import CasesList from './pages/cases/CasesList';
import CaseDetails from './pages/cases/CaseDetails';
import NewCase from './pages/cases/NewCase';

// Legal pages
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';

// Document management
import DocumentsList from './pages/documents/DocumentsList';
import DocumentDetails from './pages/documents/DocumentDetails';
import UploadDocument from './pages/documents/UploadDocument';

// Calendar page
import Calendar from './pages/Calendar';

// Define routes using createBrowserRouter
const router = createBrowserRouter([
  // Auth routes (outside main layouts)
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "/privacy", element: <PrivacyPolicy /> },

  // Main application routes (protected)
  {
    path: "/",
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "clients", element: <ClientsList /> },
      { path: "clients/new", element: <NewClient /> },
      { path: "clients/:id", element: <ClientDetails /> },
      { path: "cases", element: <CasesList /> },
      { path: "cases/new", element: <NewCase /> },
      { path: "cases/:id", element: <CaseDetails /> },
      { path: "documents", element: <DocumentsList /> },
      { path: "documents/upload", element: <UploadDocument /> },
      { path: "documents/:id", element: <DocumentDetails /> },
      { path: "calendar", element: <Calendar /> },
    ],
  },

  // Admin routes (protected and admin only)
  {
    path: "/admin",
    element: <ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "users", element: <UsersManagement /> },
      { path: "llm-integration", element: <LlmIntegration /> },
      { path: "settings", element: <SystemSettings /> },
      { path: "analytics", element: <AnalyticsDashboard /> },
    ],
  },

  // Fallback route - Navigate to dashboard if logged in, otherwise handled by ProtectedRoute
  { path: "*", element: <Navigate to="/" replace /> }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});


function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <RouterProvider router={router} />
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
