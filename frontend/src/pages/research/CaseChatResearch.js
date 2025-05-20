import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import apiRequest from '../../utils/api';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon, 
  ArrowPathIcon, 
  DocumentPlusIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FolderIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import DocumentUploadWidget from '../../components/research/DocumentUploadWidget';
import ChatDocumentAnalysis from '../../components/research/ChatDocumentAnalysis';
import DocumentReferenceSelector from '../../components/research/DocumentReferenceSelector';

const CaseChatResearch = () => {
  const { caseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showUploadWidget, setShowUploadWidget] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedDocumentRefs, setSelectedDocumentRefs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch case data and previous chat history
  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        // Fetch case details
        const caseResponse = await apiRequest(`/api/cases/${caseId}/`);
        setCaseData(caseResponse);
        
        // Fetch research queries associated with this case (chat history)
        const researchResponse = await apiRequest(`/api/research/case-research/?case_id=${caseId}`);
        
        // Convert research queries to chat format
        const chatHistory = [];
        researchResponse.forEach(query => {
          // Add user query as a message
          chatHistory.push({
            id: `q-${query.id}`,
            type: 'user',
            content: query.query_text,
            timestamp: new Date(query.timestamp)
          });
          
          // If there are results, add AI response as a message
          if (query.results && query.results.length > 0) {
            const formattedResults = query.results.map(result => ({
              title: result.title,
              excerpt: result.excerpt,
              source: result.source,
              relevance: result.relevance_score
            }));
            
            chatHistory.push({
              id: `r-${query.id}`,
              type: 'ai',
              content: 'Based on my research, here are some relevant results:',
              results: formattedResults,
              timestamp: new Date(query.timestamp)
            });
          }
        });
        
        // Sort messages by timestamp
        chatHistory.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(chatHistory);
        
        // Fetch case documents
        const documentsResponse = await apiRequest(`/api/documents/?case_id=${caseId}`);
        setDocuments(documentsResponse || []);
        
      } catch (err) {
        console.error('Failed to fetch case data:', err);
        setError('Failed to load case data. Please try again.');
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    if (caseId) {
      setLoading(true);
      fetchCaseData();
    }
  }, [caseId]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Welcome message on first load
  useEffect(() => {
    if (!isInitialLoad && messages.length === 0 && caseData) {
      setMessages([
        {
          id: 'welcome',
          type: 'ai',
          content: `Welcome to the research assistant for case: ${caseData.title}. How can I help with your legal research today?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isInitialLoad, messages, caseData]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input field
    setInput('');
    
    try {
      setLoading(true);
      
      // Send the query to the backend
      const response = await apiRequest('/api/research/perform-search/', 'POST', {
        query: userMessage.content,
        case_id: caseId
      });
      
      // Format AI response
      if (response && response.results) {
        const formattedResults = response.results.map(result => ({
          title: result.title,
          excerpt: result.excerpt,
          source: result.source,
          relevance: result.relevance_score
        }));
        
        const aiMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: 'Based on my research, here are some relevant results:',
          results: formattedResults,
          timestamp: new Date()
        };
        
        // Add AI response to chat
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } else {
        // Handle no results
        const aiMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: "I couldn't find any specific information for your query. Could you try rephrasing your question or provide more details?",
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      }
    } catch (err) {
      console.error('Failed to perform research:', err);
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: "I'm having trouble processing your request. Please try again later.",
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    setShowUploadWidget(prev => !prev);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setUploadingDocument(true);
      setUploadProgress(0);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('case_id', caseId);
      formData.append('name', file.name);
      formData.append('doc_type', 'Case Document');
      
      // Function to track upload progress
      const progressTracker = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      // Upload document to server with progress tracking
      const uploadResponse = await apiRequest(
        '/api/documents/upload/', 
        'POST', 
        formData, 
        true, 
        progressTracker
      );
      
      // Add document to the list
      setDocuments(prevDocs => [...prevDocs, uploadResponse]);
      
      // Create a system message about the upload
      const systemMessage = {
        id: `system-${Date.now()}`,
        type: 'system',
        content: `Document uploaded: ${file.name}`,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, systemMessage]);
      
      // Hide the upload widget after successful upload
      setShowUploadWidget(false);
      
      // Ask if user wants to analyze the document
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `I see you've uploaded "${file.name}". Would you like me to analyze this document?`,
        documentId: uploadResponse.id,
        documentName: file.name,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
      // Automatically select the document for reference
      setSelectedDocumentRefs(prev => [...prev, uploadResponse.id]);
      
    } catch (err) {
      console.error('Failed to upload document:', err);
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: `Failed to upload document: ${file.name}`,
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setUploadingDocument(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const analyzeDocument = async (documentId) => {
    try {
      setLoading(true);
      
      // Find document in list
      const document = documents.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Add system message about analysis
      const systemMessage = {
        id: `system-${Date.now()}`,
        type: 'system',
        content: `Analyzing document: ${document.name}`,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, systemMessage]);
      
      // Request document analysis
      const response = await apiRequest(`/api/research/analyze-document/${documentId}/`, 'POST', {
        case_id: caseId
      });
      
      // Format and add AI response with the fancy analysis component
      const analysisMessage = {
        id: `analysis-${Date.now()}`,
        type: 'ai',
        content: 'I\'ve analyzed the document and extracted the following information:',
        documentName: document.name,
        analysis: {
          summary: response.summary,
          keyClauses: response.key_clauses,
          potentialIssues: response.potential_issues,
          caseRelevance: response.case_relevance
        },
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, analysisMessage]);
      
    } catch (err) {
      console.error('Document analysis failed:', err);
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: 'I encountered an error while analyzing the document. Please try again later.',
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  if (loading && isInitialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }

  if (error && !caseData) {
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

  return (
    <div className="case-chat-research flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <Link to={`/cases/${caseId}`} className="inline-flex items-center text-primary-600 dark:text-primary-400 mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Case
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <BriefcaseIcon className="h-6 w-6 mr-2 text-primary-500" />
            {caseData?.title} - Research Chat
          </h1>
        </div>
        
        {/* Documents toggle */}
        <button
          onClick={() => setShowDocuments(!showDocuments)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Documents
          {showDocuments ? (
            <ChevronUpIcon className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      </div>
      
      {/* Documents panel - conditionally shown */}
      {showDocuments && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Case Documents</h2>
            
            <div className="relative">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
              />
              <button
                onClick={handleUploadClick}
                disabled={uploadingDocument}
                className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {uploadingDocument ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-4 w-4 mr-1" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <DocumentPlusIcon className="h-4 w-4 mr-1" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
          
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              No documents uploaded for this case yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {documents.map(doc => (
                <div 
                  key={doc.id}
                  className="px-3 py-1 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 text-sm flex items-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                  <span className="truncate max-w-xs">{doc.name}</span>
                  <button
                    onClick={() => analyzeDocument(doc.id)}
                    className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800"
                    title="Analyze document"
                  >
                    <MagnifyingGlassIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${message.type === 'system' ? 'justify-center' : ''}`}
          >
            {message.type === 'system' ? (
              <div className={`px-4 py-2 rounded text-sm ${message.isError ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                {message.content}
              </div>
            ) : (
              <div className={`max-w-2xl rounded-lg px-4 py-3 ${
                message.type === 'user' 
                  ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/30 dark:text-primary-100' 
                  : message.isError 
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                    : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-start">
                  {message.type === 'ai' && (
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="space-y-2">
                      <p>{message.content}</p>
                      
                      {/* Show search results if available */}
                      {message.results && message.results.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {message.results.map((result, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-sm">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-primary-600 dark:text-primary-400">{result.title}</h4>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {Math.round(result.relevance * 100)}% match
                                </span>
                              </div>
                              <p className="mt-1 text-gray-700 dark:text-gray-300">{result.excerpt}</p>
                              {result.source && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Source: {result.source}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Show document analysis if available */}
                      {message.analysis && (
                        <div className="mt-3 space-y-3">
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-sm">
                            <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-2">Document Summary</h4>
                            <p className="text-gray-700 dark:text-gray-300">{message.analysis.summary}</p>
                          </div>
                          
                          {message.analysis.keyClauses && message.analysis.keyClauses.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-sm">
                              <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-2">Key Clauses</h4>
                              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                                {message.analysis.keyClauses.map((clause, i) => (
                                  <li key={i}>{clause}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {message.analysis.potentialIssues && message.analysis.potentialIssues.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-sm">
                              <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-2">Potential Issues</h4>
                              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                                {message.analysis.potentialIssues.map((issue, i) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {message.analysis.caseRelevance && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-sm">
                              <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-2">Case Relevance</h4>
                              <p className="text-gray-700 dark:text-gray-300">{message.analysis.caseRelevance}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Show document ID button if available */}
                      {message.documentId && (
                        <button
                          onClick={() => analyzeDocument(message.documentId)}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          Analyze Document
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                      {formatDate(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your research question..."
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white py-2 px-4"
              disabled={loading}
            />
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
            />
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploadingDocument || loading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {uploadingDocument ? (
                <ArrowPathIcon className="animate-spin h-5 w-5 text-gray-400" />
              ) : (
                <DocumentPlusIcon className="h-5 w-5 text-gray-400 hover:text-primary-500" />
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? (
              <ArrowPathIcon className="animate-spin h-5 w-5" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CaseChatResearch;
