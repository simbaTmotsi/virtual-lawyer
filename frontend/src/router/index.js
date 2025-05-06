// Import the BillingDashboard component
import BillingDashboard from '../pages/billing/BillingDashboard';
import TimeEntries from '../pages/billing/TimeEntries';
import Invoices from '../pages/billing/Invoices';
import CreateInvoice from '../pages/billing/CreateInvoice';
import InvoiceDetail from '../pages/billing/InvoiceDetail';
import BillingReports from '../pages/billing/BillingReports';

// Make sure you have these routes defined in your routes array
const routes = [
  // Billing routes
  {
    path: '/billing',
    element: <BillingDashboard />,
    requireAuth: true,
  },
  {
    path: '/billing/reports',
    element: <BillingReports />,
    requireAuth: true,
  },
  {
    path: '/billing/time-entries',
    element: <TimeEntries />,
    requireAuth: true,
  },
  {
    path: '/billing/invoices',
    element: <Invoices />,
    requireAuth: true,
  },
  {
    path: '/billing/invoices/new',
    element: <CreateInvoice />,
    requireAuth: true,
  },
  {
    path: '/billing/invoices/:id',
    element: <InvoiceDetail />,
    requireAuth: true,
  },
];

export default routes;