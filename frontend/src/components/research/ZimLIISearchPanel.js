import React, { useState } from 'react';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  ExclamationCircleIcon,
  ScaleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const ZimLIISearchPanel = ({ results, onSearch, onClose, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [docType, setDocType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedFilter, setExpandedFilter] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Prepare search parameters
    const searchParams = {
      query: searchQuery,
      jurisdiction: jurisdiction || undefined,
      doc_type: docType || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined
    };
    
    onSearch(searchParams);
  };
  
  const toggleItemExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const renderResultContent = (item) => {
    switch (item.type) {
      case 'case':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
            {item.citation && (
              <div className="text-sm text-gray-600 dark:text-gray-400">Citation: {item.citation}</div>
            )}
            {item.court && (
              <div className="text-sm text-gray-600 dark:text-gray-400">Court: {item.court}</div>
            )}
            {item.date_decided && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Date: {formatDate(item.date_decided)}
              </div>
            )}
            
            {expandedItems[item.id] && item.excerpt && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                {item.excerpt}
              </div>
            )}
            
            {expandedItems[item.id] && item.url && (
              <div className="mt-2">
                <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View on ZimLII
                </a>
              </div>
            )}
          </div>
        );
        
      case 'legislation':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
            {item.year && (
              <div className="text-sm text-gray-600 dark:text-gray-400">Year: {item.year}</div>
            )}
            
            {expandedItems[item.id] && item.excerpt && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                {item.excerpt}
              </div>
            )}
            
            {expandedItems[item.id] && item.url && (
              <div className="mt-2">
                <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View on ZimLII
                </a>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
            
            {expandedItems[item.id] && item.excerpt && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                {item.excerpt}
              </div>
            )}
            
            {expandedItems[item.id] && item.url && (
              <div className="mt-2">
                <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View on ZimLII
                </a>
              </div>
            )}
          </div>
        );
    }
  };
  
  const renderResultIcon = (item) => {
    switch (item.type) {
      case 'case':
        return <ScaleIcon className="h-5 w-5 text-blue-500" />;
      case 'legislation':
        return <DocumentTextIcon className="h-5 w-5 text-green-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <ScaleIcon className="h-5 w-5 mr-2 text-primary-500" />
            ZimLII Search
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            title="Close panel"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Search form */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <form onSubmit={handleSearch}>
          <div className="flex">
            <div className="flex-grow">
              <label htmlFor="search-query" className="sr-only">Search Query</label>
              <input
                type="text"
                id="search-query"
                placeholder="Search Zimbabwean legal information..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!searchQuery.trim() || loading}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setExpandedFilter(!expandedFilter)}
              className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {expandedFilter ? (
                <>
                  <ChevronUpIcon className="h-4 w-4 mr-1" />
                  Hide Filters
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-1" />
                  Show Filters
                </>
              )}
            </button>
          </div>
          
          {expandedFilter && (
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jurisdiction
                </label>
                <select
                  id="jurisdiction"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">All Jurisdictions</option>
                  <option value="supreme">Supreme Court</option>
                  <option value="constitutional">Constitutional Court</option>
                  <option value="high">High Court</option>
                  <option value="labour">Labour Court</option>
                  <option value="administrative">Administrative Court</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="doc-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Document Type
                </label>
                <select
                  id="doc-type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">All Document Types</option>
                  <option value="case">Case Law</option>
                  <option value="legislation">Legislation</option>
                  <option value="constitution">Constitutional Documents</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    From Date
                  </label>
                  <input
                    type="date"
                    id="date-from"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    To Date
                  </label>
                  <input
                    type="date"
                    id="date-to"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : results ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {results.results?.length || 0} results found
              </h3>
              {results.query && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Search: "{results.query}"
                </span>
              )}
            </div>
            
            {results.error ? (
              <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3">
                <div className="flex">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-300">{results.error}</p>
                  </div>
                </div>
              </div>
            ) : results.results?.length === 0 ? (
              <div className="text-center py-8">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No results found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.results.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 mr-3">
                        {renderResultIcon(item)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {renderResultContent(item)}
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleItemExpand(item.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          {expandedItems[item.id] ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <ScaleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No search performed</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Search for Zimbabwean legal information using the form above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZimLIISearchPanel;
