import React, { useState } from 'react';
import apiRequest from '../../utils/api';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const LegalSearch = () => {
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const jurisdictions = [
    { id: 'us_federal', name: 'US Federal' },
    { id: 'us_state', name: 'US State' },
    { id: 'uk', name: 'United Kingdom' },
    { id: 'eu', name: 'European Union' },
    { id: 'international', name: 'International Law' },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/api/research/perform-search/', {
        method: 'POST',
        body: JSON.stringify({
          query: query.trim(),
          jurisdiction: jurisdiction || null
        })
      });

      setResults(response || []);
    } catch (err) {
      console.error('Research query failed:', err);
      setError('Failed to perform research. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="legal-search">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col space-y-4">
          <div>
            <label htmlFor="research-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Research Query
            </label>
            <div className="mt-1">
              <textarea
                id="research-query"
                rows={3}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                placeholder="Enter your legal research question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Jurisdiction (Optional)
            </label>
            <select
              id="jurisdiction"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            >
              <option value="">All Jurisdictions</option>
              {jurisdictions.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Searching...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="-ml-1 mr-2 h-5 w-5" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </form>

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

      {results.length > 0 && (
        <div className="results-container">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Research Results</h2>
          <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((result, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">{result.title}</h3>
                    <p className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {(result.relevance * 100).toFixed(0)}% relevance
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p className="line-clamp-2">{result.excerpt}</p>
                  </div>
                  {result.source && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Source: {result.source}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!loading && !error && query && results.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No results found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search terms or changing the jurisdiction.
          </p>
        </div>
      )}
    </div>
  );
};

export default LegalSearch;
