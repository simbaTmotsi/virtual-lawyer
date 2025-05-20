import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiRequest from '../../utils/api';
import { 
  ArrowLeftIcon, 
  MagnifyingGlassIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  ArrowPathIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const CaseResearchDashboard = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [researchQueries, setResearchQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCaseAndResearch = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch case details
        const caseResponse = await apiRequest(`/api/cases/${caseId}/`);
        setCaseData(caseResponse);
        
        // Fetch research queries associated with this case
        const researchResponse = await apiRequest(`/api/research/case-research/?case_id=${caseId}`);
        setResearchQueries(researchResponse || []);
        
      } catch (err) {
        console.error('Failed to fetch case research data:', err);
        setError('Failed to load case research information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCaseAndResearch();
    }
  }, [caseId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
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

  if (!caseData) {
    return (
      <div className="text-center py-10">
        <div className="text-lg text-gray-700 dark:text-gray-300">Case not found</div>
        <p className="text-gray-500 dark:text-gray-400">The case you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/cases" className="mt-4 inline-flex items-center text-primary-600 dark:text-primary-400">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Cases
        </Link>
      </div>
    );
  }

  return (
    <div className="case-research-dashboard">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to={`/cases/${caseId}`} className="inline-flex items-center text-primary-600 dark:text-primary-400 mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Case
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BriefcaseIcon className="h-7 w-7 mr-2 text-primary-500" />
            Research for {caseData.title}
          </h1>
        </div>
        <Link
          to="/research"
          state={{ caseId, initialTab: 'case-research' }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <MagnifyingGlassIcon className="-ml-1 mr-2 h-5 w-5" />
          New Research
        </Link>
      </div>

      {/* Research Summary */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-md p-3">
              <MagnifyingGlassIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Searches</p>
              <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                {researchQueries.length}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-md p-3">
              <DocumentTextIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Documents Analyzed</p>
              <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                {researchQueries.filter(q => q.query_text.includes('Document Analysis')).length}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-md p-3">
              <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Latest Research</p>
              <h3 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {researchQueries.length > 0 
                  ? formatDate(researchQueries[0].timestamp)
                  : 'No research yet'
                }
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Research History */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Research History</h2>
        
        {researchQueries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-10 text-center">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No research history</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              No research has been conducted for this case yet.
            </p>
            <Link
              to="/research"
              state={{ caseId, initialTab: 'case-research' }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Start Research
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {researchQueries.map((query) => (
                <li key={query.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {query.query_text.includes('Document Analysis') ? (
                        <DocumentTextIcon className="h-5 w-5 mr-3 text-gray-400" />
                      ) : (
                        <MagnifyingGlassIcon className="h-5 w-5 mr-3 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {query.query_text}
                        </p>
                        {query.jurisdiction && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Jurisdiction: {query.jurisdiction}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(query.timestamp)}
                      </span>
                      {query.results && query.results.length > 0 && (
                        <span className="ml-4 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {query.results.length} results
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {query.results && query.results.length > 0 && (
                    <div className="mt-2 ml-8">
                      <details className="text-sm">
                        <summary className="text-primary-600 dark:text-primary-400 cursor-pointer">
                          View Results
                        </summary>
                        <ul className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                          {query.results.slice(0, 3).map((result) => (
                            <li key={result.id} className="text-gray-700 dark:text-gray-300">
                              <p className="font-medium">{result.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{result.excerpt}</p>
                            </li>
                          ))}
                          {query.results.length > 3 && (
                            <li className="text-primary-600 dark:text-primary-400 text-xs">
                              +{query.results.length - 3} more results
                            </li>
                          )}
                        </ul>
                      </details>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseResearchDashboard;
