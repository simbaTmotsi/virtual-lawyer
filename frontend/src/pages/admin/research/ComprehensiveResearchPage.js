import React, { useState } from 'react';
import { callComprehensiveResearch } from '../../../utils/apiClient'; // Adjust path

const ComprehensiveResearchPage = () => {
  const [params, setParams] = useState({
    query: '',
    jurisdiction: '',
    case_id: '',
    document_ids: '', // Will be split into an array before sending
  });
  const [results, setResults] = useState(null); // Expects { ai_response: '...', legal_database_results: [...] }
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
      const payload = { query: params.query };
      if (params.jurisdiction) payload.jurisdiction = params.jurisdiction;
      if (params.case_id) payload.case_id = params.case_id;
      if (params.document_ids.trim()) {
        const documentIdsArray = params.document_ids.split(',').map(id => id.trim()).filter(id => id);
        if (documentIdsArray.length > 0) {
          payload.document_ids = documentIdsArray;
        }
      }
      const data = await callComprehensiveResearch(payload);
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Tailwind classes need to be adjusted to match the project's dark mode theme if applicable
  // For example, text-gray-700 -> dark:text-gray-300, bg-gray-50 -> dark:bg-gray-700 etc.
  // The provided code uses generic Tailwind, I will adapt some for dark mode as seen in other components.

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Comprehensive Legal Research</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Query:</label>
            <textarea 
              name="query" 
              id="query"
              value={params.query} 
              onChange={handleChange} 
              required 
              rows={4} 
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
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
          <div>
            <label htmlFor="case_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Case ID (Optional):</label>
            <input 
              type="text" 
              name="case_id" 
              id="case_id"
              value={params.case_id} 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="document_ids" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Document IDs (Optional, comma-separated):</label>
            <input 
              type="text" 
              name="document_ids" 
              id="document_ids"
              value={params.document_ids} 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
              placeholder="e.g., 123, 456, 789"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 dark:disabled:bg-gray-500"
          >
            {isLoading ? 'Researching...' : 'Start Comprehensive Research'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">Error: {error}</p>
          </div>
        )}

        {results && (
          <div className="mt-8 space-y-6">
            {results.ai_response && (
              <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">AI Analysis:</h2>
                <pre className="whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md text-gray-700 dark:text-gray-200 text-sm">
                  {results.ai_response}
                </pre>
              </div>
            )}
            {results.legal_database_results && results.legal_database_results.length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Legal Database Results:</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Excerpt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">URL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {results.legal_database_results.map((item, index) => (
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
              </div>
            )}
            {(!results.ai_response && (!results.legal_database_results || results.legal_database_results.length === 0)) && (
               <p className="text-gray-600 dark:text-gray-400">No results found for your query.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveResearchPage;
