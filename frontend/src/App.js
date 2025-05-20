import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import NotificationsProvider from './contexts/NotificationsContext';
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
import EditClient from './pages/clients/EditClient';

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

// Diary page (replacing Calendar)
import Diary from './pages/Diary';

// Billing pages
import TimeEntries from './pages/billing/TimeEntries';
import Invoices from './pages/billing/Invoices';
import CreateInvoice from './pages/billing/CreateInvoice';
import InvoiceDetail from './pages/billing/InvoiceDetail';
import BillingDashboard from './pages/billing/BillingDashboard';
import BillingReports from './pages/billing/BillingReports';
import ExpensesList from './pages/billing/ExpensesList';

// Research pages
import ResearchDashboard from './pages/research/ResearchDashboard';
import CaseResearchDashboard from './pages/research/CaseResearchDashboard';

// Tasks page
import Tasks from './pages/Tasks';

// User profile
import UserProfile from './pages/profile/UserProfile';
import UserSettings from './pages/profile/UserSettings';

function App() {
  // Define router without any hooks that rely on context
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
      path: "/",
      element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "clients", element: <ClientsList /> },
        { path: "clients/new", element: <NewClient /> },
        { path: "clients/:id", element: <ClientDetails /> },
        { path: "clients/:id/edit", element: <EditClient /> },
        { path: "cases", element: <CasesList /> },
        { path: "cases/new", element: <NewCase /> },
        { path: "cases/:id", element: <CaseDetails /> },
        { path: "documents", element: <DocumentsList /> },
        { path: "documents/upload", element: <UploadDocument /> },
        { path: "documents/:id", element: <DocumentDetails /> },
        { path: "diary", element: <Diary /> },
        
        { path: "billing", element: <BillingDashboard /> },
        { path: "billing/time-entries", element: <TimeEntries /> },
        { path: "billing/expenses", element: <ExpensesList /> },
        { path: "billing/invoices", element: <Invoices /> },
        { path: "billing/invoices/new", element: <CreateInvoice /> },
        { path: "billing/invoices/:id", element: <InvoiceDetail /> },
        { path: "billing/reports", element: <BillingReports /> },
        
        { path: "research", element: <ResearchDashboard /> },
        { path: "research/case/:caseId", element: <CaseResearchDashboard /> },
        { path: "analytics", element: <AnalyticsDashboard /> },
        { path: "tasks", element: <Tasks /> },
        { path: "profile", element: <UserProfile /> },
        { path: "settings", element: <UserSettings /> },
      ],
    },
    
    // Admin routes
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
    
    // Fallback route
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

  // Wrap the RouterProvider with all required providers
  return (
    <AuthProvider>
      <DarkModeProvider>
        <NotificationsProvider>
          <RouterProvider router={router} />
        </NotificationsProvider>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;