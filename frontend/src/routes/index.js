import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import billing components
import BillingDashboard from '../pages/billing/BillingDashboard';
import TimeEntries from '../pages/billing/TimeEntries';
import Invoices from '../pages/billing/Invoices';
import CreateInvoice from '../pages/billing/CreateInvoice';
import InvoiceDetail from '../pages/billing/InvoiceDetail';
import BillingReports from '../pages/billing/BillingReports';

// Import other components
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Other routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Billing routes */}
        <Route path="/billing" element={<BillingDashboard />} />
        <Route path="/billing/time-entries" element={<TimeEntries />} />
        <Route path="/billing/invoices" element={<Invoices />} />
        <Route path="/billing/invoices/new" element={<CreateInvoice />} />
        <Route path="/billing/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/billing/reports" element={<BillingReports />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;