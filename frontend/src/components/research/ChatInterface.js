import React, { useRef, useEffect } from 'react';
import { 
  UserIcon, 
  ArrowPathIcon, 
  DocumentIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ChatInterface = ({ messages, loading, activeDocuments }) => {
  const messagesEndRef = useRef(null);
  
  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Function to render message content with enhanced formatting
  const renderMessageContent = (content) => {
    // Check if content is a string
    if (typeof content !== 'string') {
      return content;
    }
    
    // Handle code blocks
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(formatTextWithReferences(content.substring(lastIndex, match.index)));
      }
      
      // Add code block
      parts.push(
        <pre key={`code-${match.index}`} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md my-2 overflow-auto text-xs">
          <code>{match[1]}</code>
        </pre>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(formatTextWithReferences(content.substring(lastIndex)));
    }
    
    return parts.length ? parts : formatTextWithReferences(content);
  };
  
  // Function to format text and highlight references
  const formatTextWithReferences = (text) => {
    if (!text) return text;
    
    // Handle citations [Case Name, Year]
    const citationRegex = /\[(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = citationRegex.exec(text)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${match.index}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      
      // Add citation with styling
      parts.push(
        <span key={`citation-${match.index}`} className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1 rounded">
          {match[0]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }
    
    return parts.length ? parts : text;
  };
  
  // Function to render a single message
  const renderMessage = (message) => {
    switch (message.type) {
      case 'user':
        return (
          <div className="flex items-start mb-4">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0">
              <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            
            <div className="ml-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg py-2 px-3 max-w-3xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">You</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatTime(message.timestamp)}</span>
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          </div>
        );
        
      case 'ai':
        return (
          <div className="flex items-start mb-4">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex-shrink-0">
              <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <div className="ml-3 bg-white dark:bg-gray-800 rounded-lg py-2 px-3 shadow-sm border border-gray-200 dark:border-gray-700 max-w-3xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400">AI Assistant</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatTime(message.timestamp)}</span>
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {renderMessageContent(message.content)}
              </div>
              
              {message.references && message.references.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">References:</p>
                  <ul className="text-xs space-y-1">
                    {message.references.map((ref, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-300">
                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1 rounded mr-1">
                          [{index + 1}]
                        </span>
                        {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'system':
        return (
          <div className="flex justify-center mb-4">
            <div className={`py-1 px-3 rounded-full text-xs inline-flex items-center ${
              message.isError
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {message.isError ? (
                <ExclamationCircleIcon className="h-3 w-3 mr-1" />
              ) : (
                <InformationCircleIcon className="h-3 w-3 mr-1" />
              )}
              {message.content}
            </div>
          </div>
        );
        
      case 'zimlii':
        return (
          <div className="flex items-start mb-4">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0">
              <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <div className="ml-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg py-2 px-3 max-w-3xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">ZimLII Search</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatTime(message.timestamp)}</span>
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200">
                {message.content}
              </div>
              
              {message.results && message.results.count > 0 && (
                <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
                  <a href="#" className="inline-flex items-center hover:underline">
                    <span>View search results</span>
                    <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-3 mb-4">
          <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Start a conversation</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Ask legal questions or upload documents to get help with your research.
        </p>
      </div>
    );
  }
  
  return (
    <div className="chat-interface">
      {/* Messages list */}
      {messages.map(message => (
        <div key={message.id}>
          {renderMessage(message)}
        </div>
      ))}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-start mb-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex-shrink-0">
            <ArrowPathIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-spin" />
          </div>
          
          <div className="ml-3 bg-white dark:bg-gray-800 rounded-lg py-2 px-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-primary-400 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Reference to scroll to bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatInterface;
