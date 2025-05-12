import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PrinterIcon, 
  EnvelopeIcon, 
  CheckIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import { toast } from '../../utils/notification';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoiceDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/billing/invoices/${id}/`);
      setInvoice(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch invoice details:', err);
      setError('Failed to load invoice details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id, fetchInvoiceDetails]);

  const handleStatusChange = async (newStatus) => {
    try {
      let action;
      switch (newStatus) {
        case 'sent':
          action = 'mark_as_sent';
          break;
        case 'paid':
          action = 'mark_as_paid';
          break;
        case 'void':
          action = 'void';
          break;
        default:
          console.error('Unknown status:', newStatus);
          return;
      }
      
      await apiRequest(`/api/billing/invoices/${id}/${action}/`, 'POST');
      
      // Refresh invoice data
      fetchInvoiceDetails();
      
      toast.success(`Invoice marked as ${newStatus}`);
    } catch (err) {
      console.error(`Failed to mark invoice as ${newStatus}:`, err);
      toast.error(`Failed to update invoice status. Please try again.`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'void': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // TODO: Implement actual email sending functionality
  const handleSendEmail = () => {
    toast.info('Email functionality not implemented yet.');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={() => navigate('/billing/invoices')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
          Back to Invoices
        </button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Invoice not found</p>
        <button
          onClick={() => navigate('/billing/invoices')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with actions */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <Link to="/billing/invoices" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Invoices
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Invoice #{invoice.invoice_number}</h2>
        </div>
        <div className="flex space-x-3">
          {/* Status badge */}
          <div className="flex items-center">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
              {invoice.status_display}
            </span>
          </div>
          
          {/* Refresh button */}
          <button
            onClick={fetchInvoiceDetails}
            className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <PrinterIcon className="h-4 w-4 mr-1" />
            Print
          </button>
          
          {/* Email button */}
          <button
            onClick={handleSendEmail}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <EnvelopeIcon className="h-4 w-4 mr-1" />
            Email
          </button>
          
          {/* Status change buttons */}
          {invoice.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('sent')}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PaperAirplaneIcon className="h-4 w-4 mr-1" />
              Mark as Sent
            </button>
          )}
          
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <button
              onClick={() => handleStatusChange('paid')}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Mark as Paid
            </button>
          )}
          
          {invoice.status !== 'void' && invoice.status !== 'paid' && (
            <button
              onClick={() => handleStatusChange('void')}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Void Invoice
            </button>
          )}
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
        {/* Invoice Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">From</h3>
              <div className="mt-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Your Law Firm</p>
                <p className="text-gray-600 dark:text-gray-400">123 Legal Street</p>
                <p className="text-gray-600 dark:text-gray-400">Suite 456</p>
                <p className="text-gray-600 dark:text-gray-400">Lawyer City, ST 12345</p>
                <p className="text-gray-600 dark:text-gray-400">legal@example.com</p>
              </div>
            </div>
            <div className="md:text-right">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">To</h3>
              <div className="mt-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {invoice.client_detail?.full_name || 'Unknown Client'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">{invoice.client_detail?.address || 'No address on file'}</p>
                <p className="text-gray-600 dark:text-gray-400">{invoice.client_detail?.email || 'No email on file'}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoice Number</h4>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{invoice.invoice_number}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Date</h4>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{formatDate(invoice.issue_date)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</h4>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{formatDate(invoice.due_date)}</p>
            </div>
          </div>
        </div>

        {/* Time Entries */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Time Entries</h3>
          {invoice.time_entries && invoice.time_entries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Staff</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rate</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.time_entries.map(entry => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {entry.user_detail ? `${entry.user_detail.first_name} ${entry.user_detail.last_name}` : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {parseFloat(entry.hours).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {formatCurrency(entry.rate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {formatCurrency(entry.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No time entries for this invoice.</p>
          )}
        </div>

        {/* Expenses */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expenses</h3>
          {invoice.expenses && invoice.expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.expenses.map(expense => (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No expenses for this invoice.</p>
          )}
        </div>

        {/* Invoice Summary */}
        <div className="p-6">
          <div className="flex flex-col items-end">
            <div className="w-full md:w-64">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span className="text-gray-900 dark:text-white">$0.00</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-semibold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Notes</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
