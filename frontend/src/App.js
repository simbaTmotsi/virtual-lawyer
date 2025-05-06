import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout components
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

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

// Billing pages
import TimeEntries from './pages/billing/TimeEntries';
import Invoices from './pages/billing/Invoices';
import CreateInvoice from './pages/billing/CreateInvoice';
import InvoiceDetail from './pages/billing/InvoiceDetail';

// Global auth check wrapper - modified to not use navigate
const AuthCheck = () => {
  return <Outlet />;
};

function App() {
  const router = createBrowserRouter([
    // Public routes that don't require authentication
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/register",
      element: <Register />
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />
    },
    {
      path: "/terms",
      element: <TermsOfService />
    },
    {
      path: "/privacy",
      element: <PrivacyPolicy />
    },
    
    // Protected routes
    {
      element: <AuthProvider><AuthCheck /></AuthProvider>,
      children: [
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
        
        // Billing routes with DashboardLayout
        {
          path: "/billing",
          element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
          children: [
            { path: "time-entries", element: <TimeEntries /> },
            { path: "invoices", element: <Invoices /> },
            { path: "invoices/new", element: <CreateInvoice /> },
            { path: "invoices/:id", element: <InvoiceDetail /> },
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
      ]
    },
    // Fallback route - Navigate to login
    { 
      path: "*", 
      element: <Navigate to="/login" replace /> 
    }
  ], {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  });

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
