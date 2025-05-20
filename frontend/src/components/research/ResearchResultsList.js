import React from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const ResearchResultsList = ({ results, title, emptyMessage, maxItems = 3, showViewAll = true, caseId = null }) => {
  // Take only the first maxItems
  const displayResults = results?.slice(0, maxItems) || [];
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
          <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-primary-500" /> {title || 'Research Results'}
        </h3>
        {showViewAll && (
          <Link
            to="/research"
            state={caseId ? { caseId, initialTab: 'case-research' } : {}}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
          >
            View All
          </Link>
        )}
      </div>
      
      <div className="p-4">
        {displayResults.length === 0 ? (
          <div className="text-center py-6">
            <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {emptyMessage || 'No research results available.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayResults.map((result) => (
              <li key={result.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {result.type === 'document' ? (
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400" />
                    ) : (
                      <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-gray-400" />
                    )}
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                      {result.title || result.query_text}
                    </p>
                  </div>
                  {result.timestamp && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(result.timestamp)}
                    </span>
                  )}
                </div>
                {result.excerpt && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {result.excerpt}
                  </p>
                )}
                {result.jurisdiction && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Jurisdiction: {result.jurisdiction}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResearchResultsList;
