import React, { useState } from 'react';
import { DocumentTextIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

/**
 * Component for displaying document analysis results within the chat interface
 */
const ChatDocumentAnalysis = ({ analysis, documentName }) => {
  const [expandedSection, setExpandedSection] = useState('summary');
  
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  if (!analysis) return null;

  const { summary, keyClauses, potentialIssues, caseRelevance } = analysis;
  
  return (
    <div className="chat-document-analysis mt-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-500" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Analysis of {documentName}
          </h3>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Document Summary */}
        <div className="px-4 py-3">
          <button
            onClick={() => toggleSection('summary')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Summary</span>
            {expandedSection === 'summary' ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {expandedSection === 'summary' && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>{summary}</p>
            </div>
          )}
        </div>
        
        {/* Key Clauses */}
        <div className="px-4 py-3">
          <button
            onClick={() => toggleSection('keyClauses')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Clauses</span>
            {expandedSection === 'keyClauses' ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {expandedSection === 'keyClauses' && (
            <div className="mt-2">
              <ul className="space-y-2">
                {keyClauses && keyClauses.map((clause, index) => (
                  <li key={index} className="text-sm">
                    <div className="font-medium text-gray-700 dark:text-gray-300">{clause.title}</div>
                    <div className="text-gray-600 dark:text-gray-400">{clause.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Potential Issues */}
        <div className="px-4 py-3">
          <button
            onClick={() => toggleSection('potentialIssues')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Potential Issues</span>
            {expandedSection === 'potentialIssues' ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {expandedSection === 'potentialIssues' && (
            <div className="mt-2">
              <ul className="space-y-1">
                {potentialIssues && potentialIssues.map((issue, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Case Relevance */}
        {caseRelevance && (
          <div className="px-4 py-3">
            <button
              onClick={() => toggleSection('caseRelevance')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Case Relevance</span>
              {expandedSection === 'caseRelevance' ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            {expandedSection === 'caseRelevance' && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <p>{caseRelevance}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDocumentAnalysis;
