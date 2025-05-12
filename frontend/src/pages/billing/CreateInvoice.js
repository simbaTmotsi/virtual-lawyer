import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import { toast } from '../../utils/notification';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get('client');
  
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [formData, setFormData] = useState({
    client: initialClientId || '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClients();
    if (initialClientId) {
      fetchUnbilledItems(initialClientId);
    }
  }, [initialClientId, fetchUnbilledItems]);

  const fetchClients = async () => {
    try {
      const data = await apiRequest('/api/clients/');
      setClients(data || []);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      setError('Failed to load clients. Please try again.');
    }
  };

  const fetchUnbilledItems = useCallback(async (clientId) => {
    if (!clientId) return;
    
    try {
      // Fetch unbilled time entries for this client
      const timeEntriesData = await apiRequest(`/api/billing/time-entries/?client_id=${clientId}&invoiced=false&billable=true`);
      setTimeEntries(timeEntriesData || []);
      
      // Fetch unbilled expenses for this client
      const expensesData = await apiRequest(`/api/billing/expenses/?client_id=${clientId}&invoiced=false&billable=true`);
      setExpenses(expensesData || []);
      
      // Auto-select all items if there are any
      setSelectedTimeEntries(timeEntriesData ? timeEntriesData.map(entry => entry.id) : []);
      setSelectedExpenses(expensesData ? expensesData.map(expense => expense.id) : []);
      
      // Calculate initial total
      calculateTotal(timeEntriesData || [], expensesData || []);
    } catch (err) {
      console.error('Failed to fetch unbilled items:', err);
      setError('Failed to load unbilled items. Please try again.');
    }
  }, []);

  const calculateTotal = (timeEntries = [], expenses = []) => {
    const timeTotal = timeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    const expenseTotal = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    setTotalAmount(timeTotal + expenseTotal);
  };

  const handleClientChange = async (e) => {
    const clientId = e.target.value;
    setFormData({
      ...formData,
      client: clientId
    });
    
    // Clear selected items when client changes
    setSelectedTimeEntries([]);
    setSelectedExpenses([]);
    setTimeEntries([]);
    setExpenses([]);
    
    if (clientId) {
      fetchUnbilledItems(clientId);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTimeEntrySelection = (id) => {
    const newSelected = selectedTimeEntries.includes(id)
      ? selectedTimeEntries.filter(entryId => entryId !== id)
      : [...selectedTimeEntries, id];
    
    setSelectedTimeEntries(newSelected);
    
    // Calculate total based on new selection
    const selectedEntries = timeEntries.filter(entry => newSelected.includes(entry.id));
    calculateTotal(selectedEntries, expenses.filter(expense => selectedExpenses.includes(expense.id)));
  };

  const handleExpenseSelection = (id) => {
    const newSelected = selectedExpenses.includes(id)
      ? selectedExpenses.filter(expenseId => expenseId !== id)
      : [...selectedExpenses, id];
    
    setSelectedExpenses(newSelected);
    
    // Calculate total based on new selection
    const selectedExps = expenses.filter(expense => newSelected.includes(expense.id));
    calculateTotal(timeEntries.filter(entry => selectedTimeEntries.includes(entry.id)), selectedExps);
  };

  const handleSelectAll = (type) => {
    if (type === 'time') {
      const allIds = timeEntries.map(entry => entry.id);
      setSelectedTimeEntries(selectedTimeEntries.length === timeEntries.length ? [] : allIds);
      calculateTotal(
        selectedTimeEntries.length === timeEntries.length ? [] : timeEntries,
        expenses.filter(expense => selectedExpenses.includes(expense.id))
      );
    } else {
      const allIds = expenses.map(expense => expense.id);
      setSelectedExpenses(selectedExpenses.length === expenses.length ? [] : allIds);
      calculateTotal(
        timeEntries.filter(entry => selectedTimeEntries.includes(entry.id)),
        selectedExpenses.length === expenses.length ? [] : expenses
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client) {
      setError('Please select a client');
      return;
    }
    
    if (selectedTimeEntries.length === 0 && selectedExpenses.length === 0) {
      setError('Please select at least one time entry or expense');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create the invoice
      const invoiceData = await apiRequest('/api/billing/invoices/', 'POST', formData);
      
      // Add time entries to the invoice
      if (selectedTimeEntries.length > 0) {
        await apiRequest(`/api/billing/invoices/${invoiceData.id}/add_time_entries/`, 'POST', {
          time_entry_ids: selectedTimeEntries
        });
      }
      
      // Add expenses to the invoice
      if (selectedExpenses.length > 0) {
        await apiRequest(`/api/billing/invoices/${invoiceData.id}/add_expenses/`, 'POST', {
          expense_ids: selectedExpenses
        });
      }
      
      toast.success('Invoice created successfully');
      navigate(`/billing/invoices/${invoiceData.id}`);
    } catch (err) {
      console.error('Failed to create invoice:', err);
      setError('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/billing/invoices" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mb-2">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Invoices
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Invoice</h2>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg">
        <form onSubmit={handleSubmit}>
          {/* Invoice Details */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleClientChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.first_name} {client.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                {/* This would be auto-generated, so we just show a placeholder */}
                <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Invoice Number
                </label>
                <input
                  type="text"
                  id="invoice_number"
                  name="invoice_number"
                  disabled
                  value="Auto-generated"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600"
                />
              </div>
              <div>
                <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="issue_date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Additional notes or payment instructions..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Time Entries Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Time Entries</h3>
              {timeEntries.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectAll('time')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
                >
                  {selectedTimeEntries.length === timeEntries.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            
            {!formData.client ? (
              <p className="text-gray-500 dark:text-gray-400">Please select a client to view unbilled time entries.</p>
            ) : timeEntries.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No unbilled time entries for this client.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Select</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Staff</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rate</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {timeEntries.map(entry => (
                      <tr 
                        key={entry.id} 
                        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedTimeEntries.includes(entry.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleTimeEntrySelection(entry.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedTimeEntries.includes(entry.id)}
                            onChange={() => handleTimeEntrySelection(entry.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                          <div className="max-w-xs truncate">{entry.description}</div>
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
            )}
          </div>

          {/* Expenses Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Expenses</h3>
              {expenses.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectAll('expense')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
                >
                  {selectedExpenses.length === expenses.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            
            {!formData.client ? (
              <p className="text-gray-500 dark:text-gray-400">Please select a client to view unbilled expenses.</p>
            ) : expenses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No unbilled expenses for this client.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Select</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {expenses.map(expense => (
                      <tr 
                        key={expense.id} 
                        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedExpenses.includes(expense.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleExpenseSelection(expense.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedExpenses.includes(expense.id)}
                            onChange={() => handleExpenseSelection(expense.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </td>
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
            )}
          </div>

          {/* Invoice Summary and Submit */}
          <div className="p-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {selectedTimeEntries.length} time entries selected • {selectedExpenses.length} expenses selected
                </p>
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to="/billing/invoices"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading || !formData.client || (selectedTimeEntries.length === 0 && selectedExpenses.length === 0)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        Create Invoice
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;
