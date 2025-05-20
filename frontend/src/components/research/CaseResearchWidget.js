import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiRequest from '../../utils/api';
import { MagnifyingGlassIcon, ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

const CaseResearchWidget = ({ caseId, caseName }) => {
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!caseId) return;

    const fetchRecentResearch = async () => {
      try {
        setLoading(true);
        // Use the dedicated endpoint for case research
        const response = await apiRequest(`/api/research/case-research/?case_id=${caseId}`);
        setRecentQueries(response || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch case research history:', err);
        setError('Failed to load research history for this case.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentResearch();
  }, [caseId]);

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

  return (
    <div className="case-research-widget bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
          <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-primary-500" /> Legal Research
        </h3>
        <Link
          to="/research"
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 mr-4"
          state={{ caseId: caseId, initialTab: 'case-research' }}
        >
          New Research
        </Link>
        <Link
          to={`/research/case/${caseId}`}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
        >
          View Dashboard
        </Link>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <ArrowPathIcon className="animate-spin h-6 w-6 text-primary-500" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        ) : recentQueries.length === 0 ? (
          <div className="text-center py-6">
            <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No research has been conducted for this case yet.</p>
            <Link
              to="/research"
              state={{ caseId: caseId, initialTab: 'case-research' }}
              className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Start Research
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentQueries.slice(0, 3).map((query) => (
              <li key={query.id} className="py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                    {query.query_text}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <ClockIcon className="h-3.5 w-3.5 mr-1" />
                    {formatDate(query.timestamp)}
                  </div>
                </div>
                {query.results && query.results.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {query.results.length} results found
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && recentQueries.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Link
              to="/research"
              state={{ caseId: caseId, initialTab: 'case-research' }}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
            >
              Conduct New Research
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseResearchWidget;
