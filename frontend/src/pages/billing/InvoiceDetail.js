import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { toast } from '../../utils/notification';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      
      try {
        const response = await apiRequest(`/api/billing/invoices/${id}/`);
        setInvoice(response);
        setError(null);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Failed to load invoice details');
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [id]);
  
  // Handle invoice status change
  const handleStatusChange = async (newStatus) => {
    try {
      await apiRequest(`/api/billing/invoices/${id}/${newStatus}/`, 'POST');
      toast.success(`Invoice ${newStatus.replace('_', ' ')} successfully`);
      
      // Refresh invoice data
      const updatedInvoice = await apiRequest(`/api/billing/invoices/${id}/`);
      setInvoice(updatedInvoice);
    } catch (error) {
      console.error(`Error changing invoice status to ${newStatus}:`, error);
      toast.error(`Failed to ${newStatus.replace('_', ' ')} invoice`);
    }
  };
  
  // Handle invoice deletion
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiRequest(`/api/billing/invoices/${id}/`, 'DELETE');
      toast.success('Invoice deleted successfully');
      navigate('/billing/invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Prepare for printing
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !invoice) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error || 'Invoice not found'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link
              to="/billing/invoices"
              className="text-primary-600 hover:text-primary-900"
            >
              &larr; Back to Invoices
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-4 sm:px-6 lg:px-8 print:px-0">
        <div className="hidden print:block mb-8 text-center">
          <h1 className="text-3xl font-bold">INVOICE</h1>
        </div>
        
        <div className="print:hidden">
          <Breadcrumb
            items={[
              { name: 'Home', href: '/' },
              { name: 'Billing', href: '/billing' },
              { name: 'Invoices', href: '/billing/invoices' },
              { name: `Invoice ${invoice.invoice_number}`, href: `/billing/invoices/${id}` },
            ]}
          />
          
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Invoice {invoice.invoice_number}
            </h1>
            
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              
              {invoice.status === 'draft' && (
                <button
                  onClick={() => handleStatusChange('mark_as_sent')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Mark as Sent
                </button>
              )}
              
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <button
                  onClick={() => handleStatusChange('mark_as_paid')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Mark as Paid
                </button>
              )}
              
              {invoice.status !== 'void' && invoice.status !== 'paid' && (
                <button
                  onClick={() => handleStatusChange('void')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Void Invoice
                </button>
              )}
              
              {invoice.status === 'draft' && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
              invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
              invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {invoice.status_display}
            </span>
          </div>
        </div>
        
        {/* Invoice Header */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-medium text-gray-900 print:text-black">Bill To</h2>
            <div className="mt-2">
              <p className="text-gray-900 print:text-black font-semibold">
                {invoice.client_detail?.full_name || 'Client Name'}
              </p>
              <p className="text-gray-600 print:text-black">
                {invoice.client_detail?.email || 'client@example.com'}
              </p>
              <p className="text-gray-600 print:text-black">
                {invoice.client_detail?.phone || ''}
              </p>
              <p className="text-gray-600 print:text-black whitespace-pre-line">
                {invoice.client_detail?.address || 'Client Address'}
              </p>
            </div>
          </div>
          
          <div className="md:text-right">
            <div className="grid grid-cols-2 gap-x-4 md:block">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 print:text-black">Invoice Number</h3>
                <p className="mt-1 text-gray-900 print:text-black">{invoice.invoice_number}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 print:text-black">Issue Date</h3>
                <p className="mt-1 text-gray-900 print:text-black">{formatDate(invoice.issue_date)}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 print:text-black">Due Date</h3>
                <p className="mt-1 text-gray-900 print:text-black">{formatDate(invoice.due_date)}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 print:text-black">Total Amount</h3>
                <p className="mt-1 text-xl font-bold text-gray-900 print:text-black">${parseFloat(invoice.total_amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Time Entries */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 print:text-black">Time Entries</h2>
          
          <div className="mt-4 overflow-hidden border-b border-gray-200 shadow print:shadow-none sm:rounded-lg print:rounded-none">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 print:bg-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 print:text-black uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 print:text-black uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 print:text-black uppercase tracking-wider">
                    Hours
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 print:text-black uppercase tracking-wider">
                    Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 print:text-black uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.time_entries && invoice.time_entries.length > 0 ? (
                  invoice.time_entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">
                        {entry.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 print:text-black">
                        {entry.case_detail ? `${entry.case_detail.title || entry.case_detail.case_number}: ` : ''}
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black text-right">
                        {entry.hours}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black text-right">
                        ${entry.rate ? parseFloat(entry.rate).toFixed(2) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black text-right">
                        ${parseFloat(entry.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 print:text-black">
                      No time entries found for this invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Totals */}
        <div className="mt-8 flex justify-end">
          <div className="w-full md:w-1/3">
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <dt className="text-gray-500 print:text-black">Subtotal</dt>
                <dd className="text-gray-900 print:text-black">${parseFloat(invoice.total_amount).toFixed(2)}</dd>
              </div>
              
              <div className="flex justify-between mt-2">
                <dt className="text-gray-500 print:text-black">Tax</dt>
                <dd className="text-gray-900 print:text-black">$0.00</dd>
              </div>
              
              <div className="flex justify-between mt-2 border-t border-gray-200 pt-2">
                <dt className="font-medium text-gray-900 print:text-black">Total</dt>
                <dd className="font-medium text-gray-900 print:text-black">${parseFloat(invoice.total_amount).toFixed(2)}</dd>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 print:text-black">Notes</h2>
            <div className="mt-2 p-4 bg-gray-50 print:bg-white print:border print:border-gray-300 rounded-md">
              <p className="text-gray-700 print:text-black whitespace-pre-line">{invoice.notes}</p>
            </div>
          </div>
        )}
        
        {/* Invoice Footer */}
        <div className="mt-12 border-t border-gray-200 pt-6 print:pt-8">
          <p className="text-sm text-gray-500 print:text-black text-center">
            Thank you for your business!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceDetail;
