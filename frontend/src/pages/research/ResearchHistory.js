import React, { useState, useEffect } from 'react';
import apiRequest from '../../utils/api';
import { ClockIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ResearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResearchHistory = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('/api/research/history/');
        setHistory(response || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch research history:', err);
        setError('Failed to load research history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResearchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No research history</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your research history will appear here after you perform searches or analyze documents.
        </p>
      </div>
    );
  }

  return (
    <div className="research-history">
      <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {history.map((item) => (
            <li key={item.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {item.type === 'search' ? (
                    <MagnifyingGlassIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  ) : (
                    <ClockIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  )}
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                    {item.type === 'search' ? 'Search: ' : 'Document Analysis: '}
                    {item.query_text || item.document_name}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {formatDate(item.timestamp)}
                  </p>
                </div>
              </div>
              {item.jurisdiction && (
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      Jurisdiction: {item.jurisdiction}
                    </p>
                  </div>
                </div>
              )}
              {item.type === 'search' && item.results_count && (
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      Results: {item.results_count}
                    </p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResearchHistory;
