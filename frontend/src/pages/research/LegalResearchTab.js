import React, { useState, useEffect, useRef } from 'react';
import { 
  DocumentPlusIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ScaleIcon,
  ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import DocumentUploader from '../../components/research/DocumentUploader';
import ChatInterface from '../../components/research/ChatInterface';
import DocumentManagement from '../../components/research/DocumentManagement';
import ZimLIISearchPanel from '../../components/research/ZimLIISearchPanel';

const LegalResearchTab = () => {
  // State management
  const [documents, setDocuments] = useState([]);
  const [activeDocuments, setActiveDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [zimLIIResults, setZimLIIResults] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'documents', 'zimlii'
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
    
    // Add welcome message
    setMessages([
      {
        id: 'welcome',
        type: 'system',
        content: 'Welcome to the Legal Research Assistant. You can upload documents, ask legal questions, and search for Zimbabwe legal information. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  }, []);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/documents/');
      setDocuments(response || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileUpload = async (files) => {
    try {
      setLoading(true);
      
      // Create a FormData object
      const formData = new FormData();
      
      // Add files to FormData
      Array.from(files).forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      
      // Upload the files
      const response = await apiRequest('/api/documents/upload/', 'POST', formData, true);
      
      // Update documents list with new uploads
      setDocuments(prev => [...prev, ...response]);
      
      // Add system message about uploads
      const uploadMessage = {
        id: `upload-${Date.now()}`,
        type: 'system',
        content: `Uploaded ${files.length} document(s). You can now reference them in your research.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, uploadMessage]);
      setShowUploader(false);
    } catch (err) {
      console.error('Failed to upload documents:', err);
      setError('Failed to upload documents. Please try again.');
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Failed to upload documents. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleActiveDocument = (docId) => {
    setActiveDocuments(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };
  
  const getActiveDocumentContext = () => {
    const activeDocsDetails = documents.filter(doc => activeDocuments.includes(doc.id));
    return activeDocsDetails.map(doc => ({
      id: doc.id,
      name: doc.name,
      content: doc.content || `Reference to document: ${doc.name}`
    }));
  };
  
  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    
    // Check for ZimLII command
    if (message.startsWith('/search_zimlii')) {
      handleZimLIISearch(message.replace('/search_zimlii', '').trim());
      return;
    }
    
    // Add user message to chat
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      setLoading(true);
      
      // Get active document context
      const documentContext = getActiveDocumentContext();
      
      // Get recent chat history (last 10 messages)
      const recentChat = messages.slice(-10);
      
      // Call Gemini API through our backend
      const response = await apiRequest('/api/research/query-gemini/', 'POST', {
        query: message,
        documentContext: documentContext,
        chatHistory: recentChat
      });
      
      // Check if Gemini suggests looking up ZimLII data
      if (response.needsZimLII) {
        // If the API extracted a search query for ZimLII
        if (response.zimLIIQuery) {
          handleZimLIISearch(response.zimLIIQuery);
        }
      }
      
      // Add AI response to chat
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
        references: response.references || []
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Failed to get AI response:', err);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Failed to get AI response. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleZimLIISearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    // Add user message about ZimLII search
    const userMessage = {
      id: `zimlii-query-${Date.now()}`,
      type: 'user',
      content: `/search_zimlii ${searchQuery}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      setLoading(true);
      
      // System message about searching ZimLII
      const searchingMessage = {
        id: `zimlii-searching-${Date.now()}`,
        type: 'system',
        content: `Searching ZimLII for: "${searchQuery}"...`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, searchingMessage]);
      
      // Query ZimLII API through our backend
      const response = await apiRequest('/api/research/search-zimlii/', 'POST', {
        query: searchQuery
      });
      
      // Store results in state
      setZimLIIResults(response);
      
      // Add results message
      const resultsMessage = {
        id: `zimlii-results-${Date.now()}`,
        type: 'zimlii',
        content: `Found ${response.count || 0} results on ZimLII for "${searchQuery}"`,
        timestamp: new Date(),
        results: response
      };
      
      setMessages(prev => [...prev, resultsMessage]);
      
      // Switch to ZimLII results tab if there are results
      if (response.count > 0) {
        setActiveTab('zimlii');
      }
    } catch (err) {
      console.error('Failed to search ZimLII:', err);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Failed to search ZimLII. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteDocument = async (docId) => {
    try {
      setLoading(true);
      
      // Make API request to delete the document
      await apiRequest(`/api/documents/${docId}/`, 'DELETE');
      
      // Remove document from state
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      
      // Remove from active documents if present
      setActiveDocuments(prev => prev.filter(id => id !== docId));
      
      // Add system message about deletion
      const deleteMessage = {
        id: `delete-${Date.now()}`,
        type: 'system',
        content: 'Document deleted successfully.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, deleteMessage]);
    } catch (err) {
      console.error('Failed to delete document:', err);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Failed to delete document. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="legal-research-tab h-full flex flex-col">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-5">
        <div className="px-4 sm:px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <ScaleIcon className="h-6 w-6 mr-2 text-primary-500" />
            Legal Research Assistant
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload documents, ask legal questions, and search Zimbabwe legal information.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'chat'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1" />
                Chat
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'documents'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <DocumentPlusIcon className="h-5 w-5 mr-1" />
                Documents
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                  {documents.length}
                </span>
              </div>
            </button>
            
            {zimLIIResults && (
              <button
                onClick={() => setActiveTab('zimlii')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'zimlii'
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <BookOpenIcon className="h-5 w-5 mr-1" />
                  ZimLII Results
                  {zimLIIResults.count > 0 && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                      {zimLIIResults.count}
                    </span>
                  )}
                </div>
              </button>
            )}
          </nav>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-grow bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto p-4">
              <ChatInterface 
                messages={messages} 
                loading={loading}
                activeDocuments={documents.filter(doc => activeDocuments.includes(doc.id))}
              />
            </div>
            
            {/* Active Documents Bar */}
            {activeDocuments.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center overflow-x-auto">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 whitespace-nowrap">
                    Active Documents:
                  </span>
                  
                  {documents
                    .filter(doc => activeDocuments.includes(doc.id))
                    .map(doc => (
                      <div key={doc.id} className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-2 py-1 mr-2 shadow-sm border border-gray-200 dark:border-gray-700">
                        <span className="text-xs truncate max-w-[150px]">{doc.name}</span>
                        <button 
                          className="ml-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          onClick={() => toggleActiveDocument(doc.id)}
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Message Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <button
                  onClick={() => setShowUploader(true)}
                  className="mr-2 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                  title="Upload Document"
                >
                  <DocumentPlusIcon className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => setActiveTab('documents')}
                  className="mr-2 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                  title="Select Documents"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
                
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder={loading ? "Processing..." : "Ask a legal question or type /search_zimlii [keywords] to search ZimLII"}
                    className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 pr-10 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !loading) {
                        handleSendMessage(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    disabled={loading}
                  />
                  
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {loading ? (
                      <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                      <button
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => {
                          const input = document.querySelector('input[type="text"]');
                          if (input.value) {
                            handleSendMessage(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Helper hint */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Tip: Select documents above to include them in your research context.
              </div>
            </div>
          </div>
        )}
        
        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="h-full flex flex-col">
            <DocumentManagement 
              documents={documents}
              activeDocuments={activeDocuments.map(id => ({ document_id: id }))}
              onUpload={handleFileUpload}
              onToggleActive={toggleActiveDocument}
              onDelete={deleteDocument}
              loading={loading}
              error={error}
            />
          </div>
        )}
        
        {/* ZimLII Results Tab */}
        {activeTab === 'zimlii' && zimLIIResults && (
          <div className="h-full flex flex-col">
            <ZimLIISearchPanel 
              results={zimLIIResults}
              loading={loading}
              onSearch={handleZimLIISearch}
              onClose={() => setActiveTab('chat')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalResearchTab;
