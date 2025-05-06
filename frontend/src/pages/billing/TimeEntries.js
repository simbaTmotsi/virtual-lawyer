import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  FunnelIcon, 
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import { toast } from '../../utils/notification';

const TimeEntries = () => {
  const [timeEntries, setTimeEntries] = useState([]);
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
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [formData, setFormData] = useState({
    case: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    is_billable: true,
    rate: ''
  });
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    fetchTimeEntries();
    fetchCasesAndUsers();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      let url = '/api/billing/time-entries/';
      
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
      setTimeEntries(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch time entries:', err);
      setError('Failed to load time entries. Please try again.');
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
    fetchTimeEntries();
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
    // We don't call fetchTimeEntries here because we want to wait for the user to click "Apply Filters"
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // If editing an existing entry
      if (editingEntry) {
        await apiRequest(`/api/billing/time-entries/${editingEntry.id}/`, 'PUT', payload);
        toast.success('Time entry updated successfully');
      } else {
        // Creating a new entry
        await apiRequest('/api/billing/time-entries/', 'POST', payload);
        toast.success('Time entry created successfully');
      }
      
      // Reset form and refresh data
      setFormData({
        case: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        is_billable: true,
        rate: ''
      });
      setShowNewEntryForm(false);
      setEditingEntry(null);
      fetchTimeEntries();
    } catch (err) {
      console.error('Error saving time entry:', err);
      toast.error('Failed to save time entry. Please try again.');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      case: entry.case,
      date: entry.date,
      hours: entry.hours,
      description: entry.description,
      is_billable: entry.is_billable,
      rate: entry.rate
    });
    setShowNewEntryForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) return;
    
    try {
      await apiRequest(`/api/billing/time-entries/${id}/`, 'DELETE');
      setTimeEntries(timeEntries.filter(entry => entry.id !== id));
      toast.success('Time entry deleted successfully');
    } catch (err) {
      console.error('Error deleting time entry:', err);
      toast.error('Failed to delete time entry');
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

  if (loading && timeEntries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Time Entries</h2>
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
              setEditingEntry(null);
              setFormData({
                case: '',
                date: new Date().toISOString().split('T')[0],
                hours: '',
                description: '',
                is_billable: true,
                rate: ''
              });
              setShowNewEntryForm(!showNewEntryForm);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Time Entry
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filter Time Entries</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="case" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Case</label>
              <select
                id="case"
                name="case"
                value={filters.case}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Cases</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700 dark:text-gray-300">User</label>
              <select
                id="user"
                name="user"
                value={filters.user}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="billable" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Billable Status</label>
              <select
                id="billable"
                name="billable"
                value={filters.billable}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="true">Billable</option>
                <option value="false">Non-Billable</option>
              </select>
            </div>
            <div>
              <label htmlFor="invoiced" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Status</label>
              <select
                id="invoiced"
                name="invoiced"
                value={filters.invoiced}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="true">Invoiced</option>
                <option value="false">Not Invoiced</option>
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
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

      {/* New/Edit Time Entry Form */}
      {showNewEntryForm && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingEntry ? 'Edit Time Entry' : 'New Time Entry'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="case" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Case <span className="text-red-500">*</span>
                </label>
                <select
                  id="case"
                  name="case"
                  value={formData.case}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a case</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  id="hours"
                  name="hours"
                  value={formData.hours}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="rate"
                  name="rate"
                  value={formData.rate}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="If left blank, user's default rate will be used"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the work performed..."
                ></textarea>
              </div>
              <div>
                <div className="flex items-center">
                  <input
                    id="is_billable"
                    name="is_billable"
                    type="checkbox"
                    checked={formData.is_billable}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_billable" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    This time is billable
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewEntryForm(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {editingEntry ? 'Update' : 'Save'}
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

      {/* Time Entries Table */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Time Entries</h3>
          <button 
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            onClick={fetchTimeEntries}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" /> Refresh
          </button>
        </div>
        {timeEntries.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No time entries found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new time entry.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingEntry(null);
                  setFormData({
                    case: '',
                    date: new Date().toISOString().split('T')[0],
                    hours: '',
                    description: '',
                    is_billable: true,
                    rate: ''
                  });
                  setShowNewEntryForm(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Time Entry
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {timeEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {entry.case_detail?.title || 'Unknown Case'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                      <div className="max-w-xs truncate">{entry.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {entry.user_detail ? `${entry.user_detail.first_name} ${entry.user_detail.last_name}` : 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                      {parseFloat(entry.hours).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                      ${parseFloat(entry.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {entry.is_billable ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Billable
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Non-billable
                          </span>
                        )}
                        {entry.invoice && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Invoiced
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!entry.invoice && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      {entry.invoice && (
                        <Link
                          to={`/billing/invoices/${entry.invoice}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                        >
                          View Invoice
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeEntries;
