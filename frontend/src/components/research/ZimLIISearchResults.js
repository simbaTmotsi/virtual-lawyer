import React from 'react';
import { 
  BookOpenIcon, 
  ArrowPathIcon, 
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

const ZimLIISearchResults = ({ results, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }
  
  if (!results) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No search results</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Search for legal information using the chat interface.
        </p>
      </div>
    );
  }
  
  if (results.error) {
    return (
      <div className="text-center py-12">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error fetching results</h3>
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">
          {results.error}
        </p>
      </div>
    );
  }
  
  if (results.count === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No results found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your search didn't return any results. Try different keywords.
        </p>
      </div>
    );
  }
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Helper function to get the appropriate icon for a result
  const getResultIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'case':
      case 'judgment':
        return <ScaleIcon className="h-5 w-5" />;
      case 'legislation':
      case 'act':
        return <DocumentTextIcon className="h-5 w-5" />;
      default:
        return <BookOpenIcon className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-md p-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Search Results
          </h3>
          <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {results.count} results
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Query: "{results.query || 'Unknown query'}"
        </p>
        {results.jurisdiction && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Jurisdiction: {results.jurisdiction}
          </p>
        )}
      </div>
      
      {/* Results list */}
      <div className="space-y-4">
        {results.items?.map((item, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 shadow-sm rounded-md overflow-hidden">
            <div className="p-4">
              <div className="flex items-start">
                <div className={`flex-shrink-0 rounded-md p-2 ${
                  item.type?.toLowerCase() === 'case' || item.type?.toLowerCase() === 'judgment'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {getResultIcon(item.type)}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                      {item.title || 'Untitled Document'}
                    </h4>
                    {item.type && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        item.type?.toLowerCase() === 'case' || item.type?.toLowerCase() === 'judgment'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {item.type}
                      </span>
                    )}
                  </div>
                  
                  {item.citation && (
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {item.citation}
                    </p>
                  )}
                  
                  {item.date && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.date)}
                    </p>
                  )}
                  
                  {item.court && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {item.court}
                    </p>
                  )}
                  
                  {item.excerpt && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.excerpt.length > 300 
                          ? item.excerpt.substring(0, 300) + '...' 
                          : item.excerpt
                        }
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-end">
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium inline-flex items-center"
                      >
                        View on ZimLII
                        <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {results.pagination && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              disabled={!results.pagination.prev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={!results.pagination.next}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{results.pagination.startIndex || 1}</span> to{' '}
                <span className="font-medium">{results.pagination.endIndex || results.count}</span> of{' '}
                <span className="font-medium">{results.count}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  disabled={!results.pagination.prev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  disabled={!results.pagination.next}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZimLIISearchResults;
