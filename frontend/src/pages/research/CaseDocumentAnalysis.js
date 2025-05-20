import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiRequest from '../../utils/api';
import { DocumentIcon, ArrowPathIcon, DocumentTextIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

const CaseDocumentAnalysis = () => {
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [fetchingCases, setFetchingCases] = useState(true);
  const location = useLocation();

  // Fetch cases on component mount
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setFetchingCases(true);
        const response = await apiRequest('/api/cases/');
        setCases(response || []);
        
        // If we have a case_id in the location state, select it and fetch its documents
        if (location.state && location.state.caseId) {
          const caseId = location.state.caseId.toString();
          setSelectedCase(caseId);
        }
      } catch (err) {
        console.error('Failed to fetch cases:', err);
      } finally {
        setFetchingCases(false);
      }
    };

    fetchCases();
  }, [location]);

  // Fetch case documents when a case is selected
  useEffect(() => {
    const fetchCaseDocuments = async () => {
      if (!selectedCase) {
        setDocuments([]);
        return;
      }

      try {
        setFetchingDocs(true);
        // This endpoint would need to be implemented to filter documents by case
        const response = await apiRequest(`/api/documents/?case_id=${selectedCase}`);
        setDocuments(response || []);
      } catch (err) {
        console.error(`Failed to fetch documents for case ${selectedCase}:`, err);
      } finally {
        setFetchingDocs(false);
      }
    };

    fetchCaseDocuments();
  }, [selectedCase]);

  const analyzeDocument = async () => {
    if (!selectedDocument) return;

    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);
      
      // Include the case_id in the request
      const response = await apiRequest(`/api/research/analyze-document/${selectedDocument}/`, 'POST', {
        case_id: selectedCase
      });

      setAnalysis(response);
    } catch (err) {
      console.error('Document analysis failed:', err);
      setError('Failed to analyze document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseChange = (e) => {
    setSelectedCase(e.target.value);
    setSelectedDocument(null); // Reset selected document when case changes
    setAnalysis(null); // Reset analysis when case changes
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'text-red-500';
      case 'doc':
      case 'docx':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="case-document-analysis">
      <div className="mb-6">
        <label htmlFor="case-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Case
        </label>
        <div className="mt-1">
          <select
            id="case-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={selectedCase}
            onChange={handleCaseChange}
            disabled={fetchingCases}
          >
            <option value="">Select a case</option>
            {cases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCase && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="document-selection">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2 text-primary-500" />
              Case Documents
            </h2>
            
            {fetchingDocs ? (
              <div className="flex justify-center items-center h-64">
                <ArrowPathIcon className="animate-spin h-8 w-8 text-primary-500" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This case has no documents to analyze.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                  {documents.map((doc) => (
                    <li key={doc.id}>
                      <button
                        onClick={() => setSelectedDocument(doc.id)}
                        className={`w-full px-4 py-4 sm:px-6 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedDocument === doc.id ? 'bg-gray-50 dark:bg-gray-700' : ''
                        }`}
                      >
                        <DocumentTextIcon className={`flex-shrink-0 h-5 w-5 mr-3 ${getFileIcon(doc.filename || doc.name)}`} />
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {doc.name || doc.filename}
                          </p>
                          {doc.doc_type && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {doc.doc_type}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={analyzeDocument}
                disabled={loading || !selectedDocument}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" />
                    Analyze Document
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="analysis-results">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Analysis Results</h2>
            
            {error && (
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
            )}
            
            {!error && !analysis && !loading && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No analysis yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select a document and click "Analyze Document" to get started.
                </p>
              </div>
            )}
            
            {loading && (
              <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-center">
                  <ArrowPathIcon className="animate-spin mx-auto h-8 w-8 text-primary-500" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Analyzing document...
                  </p>
                </div>
              </div>
            )}
            
            {analysis && (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Document Analysis Summary
                  </h3>
                  {selectedCase && (
                    <p className="mt-1 max-w-2xl text-sm text-primary-600 dark:text-primary-400">
                      Case: {cases.find(c => c.id.toString() === selectedCase)?.title}
                    </p>
                  )}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Summary</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{analysis.summary}</dd>
                    </div>
                    
                    {analysis.key_clauses && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Key Clauses</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          <ul className="list-disc pl-5 space-y-1">
                            {analysis.key_clauses.map((clause, i) => (
                              <li key={i}>{clause}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                    
                    {analysis.potential_issues && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Potential Issues</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          <ul className="list-disc pl-5 space-y-1">
                            {analysis.potential_issues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                    
                    {analysis.case_relevance && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Relevance to Case</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{analysis.case_relevance}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDocumentAnalysis;
