import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { apiRequest } from '../../utils/api';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { toast } from '../../utils/notification';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [filteredTimeEntries, setFilteredTimeEntries] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const [invoiceData, setInvoiceData] = useState({
    client: '',
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    notes: '',
  });
  
  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiRequest('/api/clients/');
        setClients(response);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      }
    };
    
    fetchClients();
  }, []);
  
  // Fetch unbilled time entries
  useEffect(() => {
    const fetchTimeEntries = async () => {
      try {
        const response = await apiRequest('/api/billing/time-entries/unbilled/');
        setTimeEntries(response);
      } catch (error) {
        console.error('Error fetching time entries:', error);
        toast.error('Failed to load time entries');
      }
    };
    
    fetchTimeEntries();
  }, []);
  
  // Filter time entries when client changes
  useEffect(() => {
    if (invoiceData.client) {
      const filtered = timeEntries.filter(entry => 
        entry.case_detail && entry.case_detail.client === parseInt(invoiceData.client)
      );
      setFilteredTimeEntries(filtered);
    } else {
      setFilteredTimeEntries([]);
    }
    
    // Clear selected entries when client changes
    setSelectedEntries([]);
    updateTotals([]);
  }, [invoiceData.client, timeEntries]);
  
  // Update totals when selected entries change
  const updateTotals = (entries) => {
    const hours = entries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
    const amount = entries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    
    setTotalHours(hours);
    setTotalAmount(amount);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({ ...prev, [name]: value }));
  };
  
  // Toggle time entry selection
  const toggleEntrySelection = (entry) => {
    let newSelectedEntries;
    
    if (selectedEntries.some(e => e.id === entry.id)) {
      newSelectedEntries = selectedEntries.filter(e => e.id !== entry.id);
    } else {
      newSelectedEntries = [...selectedEntries, entry];
    }
    
    setSelectedEntries(newSelectedEntries);
    updateTotals(newSelectedEntries);
  };
  
  // Select all time entries
  const selectAllEntries = () => {
    if (selectedEntries.length === filteredTimeEntries.length) {
      setSelectedEntries([]);
      updateTotals([]);
    } else {
      setSelectedEntries([...filteredTimeEntries]);
      updateTotals(filteredTimeEntries);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!invoiceData.client) {
      toast.error('Please select a client');
      return;
    }
    
    if (selectedEntries.length === 0) {
      toast.error('Please select at least one time entry');
      return;
    }
    
    setLoading(true);
    
    try {
      // First create the invoice
      const invoicePayload = {
        client: invoiceData.client,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        notes: invoiceData.notes,
        status: 'draft',
      };
      
      const invoice = await apiRequest('/api/billing/invoices/', 'POST', invoicePayload);
      
      // Then add time entries to the invoice
      const entryIds = selectedEntries.map(entry => entry.id);
      await apiRequest(`/api/billing/invoices/${invoice.id}/add_time_entries/`, 'POST', {
        time_entry_ids: entryIds
      });
      
      toast.success('Invoice created successfully');
      navigate(`/billing/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
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
            { name: 'Create Invoice', href: '/billing/invoices/new' },
          ]}
        />
        
        <div className="mt-4">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Invoice</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Invoice Details */}
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">Invoice Details</h2>
            
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
              <div className="sm:col-span-3">
                <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                  Client *
                </label>
                <select
                  id="client"
                  name="client"
                  value={invoiceData.client}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.full_name || `${client.first_name} ${client.last_name}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="sm:col-span-3">
                {/* Placeholder for invoice number - will be auto-generated */}
                <label className="block text-sm font-medium text-gray-700">
                  Invoice Number
                </label>
                <div className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-gray-500 sm:text-sm">
                  Will be generated automatically
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700">
                  Issue Date
                </label>
                <input
                  type="date"
                  id="issue_date"
                  name="issue_date"
                  value={invoiceData.issue_date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={invoiceData.due_date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={invoiceData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Additional notes to the client"
                />
              </div>
            </div>
          </div>
          
          {/* Time Entries */}
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Time Entries</h2>
              
              {filteredTimeEntries.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllEntries}
                  className="text-sm text-primary-600 hover:text-primary-900"
                >
                  {selectedEntries.length === filteredTimeEntries.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              )}
            </div>
            
            {!invoiceData.client ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">Please select a client to view billable time entries.</p>
              </div>
            ) : filteredTimeEntries.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">No unbilled time entries found for this client.</p>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <span className="sr-only">Select</span>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Case
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTimeEntries.map((entry) => (
                      <tr 
                        key={entry.id}
                        onClick={() => toggleEntrySelection(entry)}
                        className={selectedEntries.some(e => e.id === entry.id) 
                          ? 'bg-primary-50 cursor-pointer' 
                          : 'hover:bg-gray-50 cursor-pointer'
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedEntries.some(e => e.id === entry.id)}
                            onChange={() => toggleEntrySelection(entry)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.case_detail?.title || entry.case_detail?.case_number || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                          {entry.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.hours}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${parseFloat(entry.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Summary */}
            {selectedEntries.length > 0 && (
              <div className="mt-6 flex justify-between border-t border-gray-200 pt-4">
                <div>
                  <p className="text-sm text-gray-500">Selected entries: {selectedEntries.length}</p>
                  <p className="text-sm text-gray-500">Total hours: {totalHours.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Total Amount: ${totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/billing/invoices')}
              className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedEntries.length === 0}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateInvoice;
