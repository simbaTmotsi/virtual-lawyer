import React, { useState } from 'react';
import { callRecommendCases } from '../../../utils/apiClient'; // Adjust path

const CaseRecommendationsPage = () => {
  const [params, setParams] = useState({
    description: '',
    case_id: '',
    document_id: '',
    jurisdiction: '',
  });
  const [recommendations, setRecommendations] = useState(null); // Expects { recommended_cases: [...] }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!params.description && !params.case_id && !params.document_id) {
      setError('Please provide at least one input: Description, Case ID, or Document ID.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      const payload = {};
      if (params.description) payload.description = params.description;
      if (params.case_id) payload.case_id = params.case_id;
      if (params.document_id) payload.document_id = params.document_id;
      if (params.jurisdiction) payload.jurisdiction = params.jurisdiction;

      const data = await callRecommendCases(payload);
      setRecommendations(data.recommended_cases || []);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Adapting Tailwind classes for consistency with the project's dark mode theme
  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Case Recommendations</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional):</label>
            <textarea 
              name="description" 
              id="description"
              value={params.description} 
              onChange={handleChange} 
              rows={3} 
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100" 
              placeholder="Describe the legal situation or desired case characteristics..."
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
              placeholder="Enter Case ID for context..."
            />
          </div>
          <div>
            <label htmlFor="document_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Document ID (Optional):</label>
            <input 
              type="text" 
              name="document_id" 
              id="document_id"
              value={params.document_id} 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100" 
              placeholder="Enter Document ID for context..."
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
              placeholder="e.g., California, UK, Federal"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 dark:disabled:bg-gray-500"
          >
            {isLoading ? 'Getting Recommendations...' : 'Get Case Recommendations'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">Error: {error}</p>
          </div>
        )}

        {recommendations && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recommended Cases:</h2>
            {recommendations.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No recommendations found for your criteria.</p>
            ) : (
              <div className="overflow-x-auto shadow border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Summary/Excerpt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Citation/Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recommendations.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300"><p className="line-clamp-3">{item.excerpt || item.summary}</p></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.source || item.citation}</td>
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

export default CaseRecommendationsPage;
