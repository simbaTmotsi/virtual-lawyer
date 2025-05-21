import React, { useState } from 'react';
import { callSearchLegalDatabases } from '../../../utils/apiClient'; // Adjust path if needed
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Icon for button

// Mock list of databases - in a real app, this might come from config or API
const LII_DATABASES = [
  { value: 'all', label: 'All Databases' },
  { value: 'ZimLII', label: 'ZimLII (Zimbabwe)' },
  { value: 'AfricanLII', label: 'AfricanLII' },
  { value: 'SAFLII', label: 'SAFLII (Southern Africa)' },
  { value: 'NigeriaLII', label: 'NigeriaLII' },
  { value: 'GhanaLII', label: 'GhanaLII' },
  { value: 'KenyaLII', label: 'KenyaLII (Kenya Law)' },
  { value: 'UgandaLII', label: 'UgandaLII' },
  // Add others as relevant
];

const LegalDatabaseSearchPage = () => {
  const [params, setParams] = useState({
    query: '',
    database: 'all',
    jurisdiction: '',
    doc_type: '',
    date_from: '',
    date_to: '',
  });
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const payload = { query: params.query, database: params.database };
      if (params.jurisdiction) payload.jurisdiction = params.jurisdiction;
      if (params.doc_type) payload.doc_type = params.doc_type;
      if (params.date_from) payload.date_from = params.date_from;
      if (params.date_to) payload.date_to = params.date_to;
      
      const data = await callSearchLegalDatabases(payload);
      setResults(data.items || []); 
    } catch (err) {
      setError(err.message || 'An error occurred while searching legal databases.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Legal Database Search</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Query Input */}
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Query:</label>
            <input 
              type="text" 
              name="query" 
              id="query"
              value={params.query} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Database Select */}
          <div>
            <label htmlFor="database" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Database:</label>
            <select 
              name="database" 
              id="database"
              value={params.database} 
              onChange={handleChange} 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-gray-900 dark:text-gray-100"
            >
              {LII_DATABASES.map(db => <option key={db.value} value={db.value}>{db.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jurisdiction Input */}
            <div>
              <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jurisdiction (Optional):</label>
              <input 
                type="text" 
                name="jurisdiction" 
                id="jurisdiction"
                value={params.jurisdiction} 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Document Type Input */}
            <div>
              <label htmlFor="doc_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Document Type (Optional):</label>
              <input 
                type="text" 
                name="doc_type" 
                id="doc_type"
                value={params.doc_type} 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date From Input */}
            <div>
              <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date From (Optional):</label>
              <input 
                type="date" 
                name="date_from" 
                id="date_from"
                value={params.date_from} 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Date To Input */}
            <div>
              <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date To (Optional):</label>
              <input 
                type="date" 
                name="date_to" 
                id="date_to"
                value={params.date_to} 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 dark:disabled:bg-gray-500"
          >
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            {isLoading ? 'Searching...' : 'Search Databases'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">Error: {error}</p>
          </div>
        )}

        {results && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Search Results:</h2>
            {results.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No results found for your query.</p>
            ) : (
              <div className="overflow-x-auto shadow border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Excerpt</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">URL</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {results.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300"><p className="line-clamp-3">{item.excerpt}</p></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.source}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400 hover:underline">
                          {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">View Source</a> : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.relevance_score?.toFixed(2) || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalDatabaseSearchPage;
