import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  FunnelIcon, 
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import { toast } from '../../utils/notification';

const ExpensesList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    case: '',
    user: '',
    startDate: '',
    endDate: '',
    billable: '',
    invoiced: ''
  });
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [showNewExpenseForm, setShowNewExpenseForm] = useState(false);
  const [formData, setFormData] = useState({
    case: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    is_billable: true,
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchCasesAndUsers();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let url = '/api/billing/expenses/';
      
      // Add any active filters to the request
      const queryParams = [];
      if (filters.case) queryParams.push(`case_id=${filters.case}`);
      if (filters.user) queryParams.push(`user_id=${filters.user}`);
      if (filters.startDate) queryParams.push(`start_date=${filters.startDate}`);
      if (filters.endDate) queryParams.push(`end_date=${filters.endDate}`);
      if (filters.billable) queryParams.push(`billable=${filters.billable}`);
      if (filters.invoiced) queryParams.push(`invoiced=${filters.invoiced}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const data = await apiRequest(url);
      setExpenses(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCasesAndUsers = async () => {
    try {
      const casesData = await apiRequest('/api/cases/');
      setCases(casesData || []);
      
      const usersData = await apiRequest('/api/users/');
      setUsers(usersData || []);
    } catch (err) {
      console.error('Failed to fetch cases or users:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    fetchExpenses();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      case: '',
      user: '',
      startDate: '',
      endDate: '',
      billable: '',
      invoiced: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setFileUpload(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      
      // Add all form fields to the FormData
      Object.keys(formData).forEach(key => {
        payload.append(key, formData[key]);
      });
      
      // Add file if one was selected
      if (fileUpload) {
        payload.append('receipt', fileUpload);
      }
      
      // If editing an existing expense
      if (editingExpense) {
        await apiRequest(`/api/billing/expenses/${editingExpense.id}/`, 'PUT', payload, true);
        toast.success('Expense updated successfully');
      } else {
        // Creating a new expense
        await apiRequest('/api/billing/expenses/', 'POST', payload, true);
        toast.success('Expense created successfully');
      }
      
      // Reset form and refresh data
      setFormData({
        case: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        is_billable: true,
      });
      setFileUpload(null);
      setShowNewExpenseForm(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (err) {
      console.error('Error saving expense:', err);
      toast.error('Failed to save expense. Please try again.');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      case: expense.case,
      date: expense.date,
      description: expense.description,
      amount: expense.amount,
      is_billable: expense.is_billable,
    });
    setShowNewExpenseForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await apiRequest(`/api/billing/expenses/${id}/`, 'DELETE');
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast.success('Expense deleted successfully');
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('Failed to delete expense');
    }
  };

  const formatDate = (dateString) => {
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

  if (loading && expenses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Expenses</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Filter
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setFormData({
                case: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                is_billable: true,
              });
              setFileUpload(null);
              setShowNewExpenseForm(!showNewExpenseForm);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Expense
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filter Expenses</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter fields */}
            {/* ...existing code... */}
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* New/Edit Expense Form */}
      {showNewExpenseForm && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingExpense ? 'Edit Expense' : 'New Expense'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Form fields */}
              {/* ...existing code... */}
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewExpenseForm(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {editingExpense ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
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

      {/* Expenses Table */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Expenses</h3>
          <button 
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            onClick={fetchExpenses}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" /> Refresh
          </button>
        </div>
        
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <ReceiptRefundIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No expenses found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new expense.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setFormData({
                    case: '',
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: '',
                    is_billable: true,
                  });
                  setFileUpload(null);
                  setShowNewExpenseForm(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Expense
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Case</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Receipt</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Expense rows would go here */}
                {/* ...existing code... */}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesList;