import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import apiRequest from '../../utils/api';
import { toast } from '../../utils/notification';

const TimeEntries = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [filters, setFilters] = useState({
    case_id: '',
    billable: '',
    unbilled: 'true',
    date_from: '',
    date_to: ''
  });
  
  // Form state for new time entry
  const [newEntry, setNewEntry] = useState({
    case: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: '',
    description: '',
    is_billable: true,
    rate: ''
  });

  // Wrap fetchTimeEntries in useCallback to prevent it from changing on every render
  const fetchTimeEntries = useCallback(async () => {
    setLoading(true);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          queryParams.append(key, value);
        }
      }
      
      const response = await apiRequest(`/api/billing/time-entries/?${queryParams.toString()}`);
      setTimeEntries(response);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast.error('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch cases for the dropdown
  const fetchCases = async () => {
    try {
      const response = await apiRequest('/api/cases/');
      setCases(response);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };
  
  // Initial data loading
  useEffect(() => {
    fetchCases();
    fetchTimeEntries();
  }, [fetchTimeEntries]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await apiRequest('/api/billing/time-entries/', 'POST', newEntry);
      toast.success('Time entry added successfully');
      
      // Reset form
      setNewEntry({
        case: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        hours: '',
        description: '',
        is_billable: true,
        rate: ''
      });
      
      // Refresh time entries
      fetchTimeEntries();
    } catch (error) {
      console.error('Error adding time entry:', error);
      toast.error('Failed to add time entry');
    }
  };

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mt-4">
        <h1 className="text-2xl font-semibold text-gray-900">Time Entries</h1>
        <p className="mt-2 text-sm text-gray-700">
          Record and manage time spent on cases.
        </p>
      </div>
      
      {/* Add Time Entry Form */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Add New Time Entry</h2>
        
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
          <div className="sm:col-span-3">
            <label htmlFor="case" className="block text-sm font-medium text-gray-700">
              Case
            </label>
            <select
              id="case"
              name="case"
              value={newEntry.case}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select a case</option>
              {cases.map(caseItem => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.title || caseItem.case_number}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={newEntry.date}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
              Hours
            </label>
            <input
              type="number"
              id="hours"
              name="hours"
              min="0.1"
              step="0.1"
              value={newEntry.hours}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
              Rate (Optional)
            </label>
            <input
              type="number"
              id="rate"
              name="rate"
              min="0"
              step="0.01"
              value={newEntry.rate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-center h-full pt-5">
              <input
                id="is_billable"
                name="is_billable"
                type="checkbox"
                checked={newEntry.is_billable}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_billable" className="ml-2 block text-sm text-gray-900">
                Billable
              </label>
            </div>
          </div>
          
          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={newEntry.description}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          
          <div className="sm:col-span-6">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Time Entry
            </button>
          </div>
        </form>
      </div>
      
      {/* Filters */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        
        <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-4 sm:gap-x-4">
          <div>
            <label htmlFor="filter-case" className="block text-sm font-medium text-gray-700">
              Case
            </label>
            <select
              id="filter-case"
              name="case_id"
              value={filters.case_id}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Cases</option>
              {cases.map(caseItem => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.title || caseItem.case_number}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="filter-billable" className="block text-sm font-medium text-gray-700">
              Billable Status
            </label>
            <select
              id="filter-billable"
              name="billable"
              value={filters.billable}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="true">Billable</option>
              <option value="false">Non-billable</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="filter-date-from" className="block text-sm font-medium text-gray-700">
              From Date
            </label>
            <input
              type="date"
              id="filter-date-from"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="filter-date-to" className="block text-sm font-medium text-gray-700">
              To Date
            </label>
            <input
              type="date"
              id="filter-date-to"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Time Entries Table */}
      <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
        {loading ? (
          <div className="py-12 text-center">
            <svg className="animate-spin h-8 w-8 mx-auto text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-500">Loading time entries...</p>
          </div>
        ) : timeEntries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No time entries found matching your filters.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.case_detail ? entry.case_detail.title || entry.case_detail.case_number : 'N/A'}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {entry.is_billable ? (
                      entry.invoice ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Billed
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Unbilled
                        </span>
                      )
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Non-billable
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TimeEntries;
