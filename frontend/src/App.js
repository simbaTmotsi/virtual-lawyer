import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Main app routes */}
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            
            {/* Client routes */}
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/new" element={<NewClient />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            
            {/* Case routes */}
            <Route path="cases" element={<CasesList />} />
            <Route path="cases/new" element={<NewCase />} />
            <Route path="cases/:id" element={<CaseDetails />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="llm-integration" element={<LlmIntegration />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
