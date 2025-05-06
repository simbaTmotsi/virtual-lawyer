import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { toast } from '../../utils/notification';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    client_id: '',
    status: '',
  });

  // Wrap fetchInvoices in useCallback to memoize it
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          queryParams.append(key, value);
        }
      }
      
      const response = await apiRequest(`/api/billing/invoices/?${queryParams.toString()}`);
      setInvoices(response);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [filters]); // Add filters as a dependency
  
  // Fetch clients for the dropdown
  const fetchClients = async () => {
    try {
      const response = await apiRequest('/api/clients/');
      setClients(response);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };
  
  // Initial data loading
  useEffect(() => {
    fetchClients();
    fetchInvoices(); // Now fetchInvoices is stable between renders if filters don't change
  }, [fetchInvoices]); // Add fetchInvoices as a dependency
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle invoice status change
  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await apiRequest(`/api/billing/invoices/${invoiceId}/${newStatus}/`, 'POST');
      toast.success(`Invoice ${newStatus.replace('_', ' ')} successfully`);
      fetchInvoices();
    } catch (error) {
      console.error(`Error changing invoice status to ${newStatus}:`, error);
      toast.error(`Failed to ${newStatus.replace('_', ' ')} invoice`);
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { name: 'Home', href: '/' },
            { name: 'Billing', href: '/billing' },
            { name: 'Invoices', href: '/billing/invoices' },
          ]}
        />
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
            <p className="mt-2 text-sm text-gray-700">
              Create and manage client invoices.
            </p>
          </div>
          
          <Link
            to="/billing/invoices/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Create New Invoice
          </Link>
        </div>
        
        {/* Filters */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
          
          <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <label htmlFor="filter-client" className="block text-sm font-medium text-gray-700">
                Client
              </label>
              <select
                id="filter-client"
                name="client_id"
                value={filters.client_id}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.full_name || `${client.first_name} ${client.last_name}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="filter-status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="void">Void</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Invoices Table */}
        <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
          {loading ? (
            <div className="py-12 text-center">
              <svg className="animate-spin h-8 w-8 mx-auto text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-500">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">No invoices found matching your filters.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900">
                      <Link to={`/billing/invoices/${invoice.id}`}>
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.client_detail?.full_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.issue_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.due_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(invoice.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/billing/invoices/${invoice.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                        
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(invoice.id, 'mark_as_sent')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Send
                          </button>
                        )}
                        
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <button
                            onClick={() => handleStatusChange(invoice.id, 'mark_as_paid')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Paid
                          </button>
                        )}
                        
                        {invoice.status !== 'void' && invoice.status !== 'paid' && (
                          <button
                            onClick={() => handleStatusChange(invoice.id, 'void')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
