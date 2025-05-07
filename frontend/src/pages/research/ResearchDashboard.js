import React, { useState } from 'react';
import LegalSearch from './LegalSearch';
import DocumentAnalysis from './DocumentAnalysis';
import ResearchHistory from './ResearchHistory';

const ResearchDashboard = () => {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Legal Research</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Use AI-powered tools to enhance your legal research and document analysis.
        </p>
      </div>
      
      {/* Research Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('search')}
            className={`${
              activeTab === 'search'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Legal Search
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`${
              activeTab === 'analysis'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Document Analysis
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Research History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'search' && <LegalSearch />}
        {activeTab === 'analysis' && <DocumentAnalysis />}
        {activeTab === 'history' && <ResearchHistory />}
      </div>
    </div>
  );
};

export default ResearchDashboard;
