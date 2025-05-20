import React, { useState } from 'react';
import { 
  DocumentIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const DocumentList = ({ documents, activeDocuments, toggleActiveDocument, onDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = (docId) => {
    if (confirmDelete === docId) {
      onDelete(docId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(docId);
      
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => {
        setConfirmDelete(null);
      }, 3000);
    }
  };
  
  const getFileIcon = (filename) => {
    if (!filename) return 'text-gray-500';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'text-red-500';
      case 'doc':
      case 'docx':
        return 'text-blue-500';
      case 'txt':
        return 'text-gray-500';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You haven't uploaded any documents yet.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Search bar */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Info if no results */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <ExclamationCircleIcon className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No matches</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No documents match your search. Try different keywords.
          </p>
        </div>
      )}
      
      {/* Document list */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredDocuments.map((doc) => (
          <li 
            key={doc.id} 
            className={`py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition duration-150 ${
              activeDocuments.includes(doc.id) ? 'bg-primary-50 dark:bg-primary-900/30' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <div className={`flex-shrink-0 ${getFileIcon(doc.name)}`}>
                  <DocumentIcon className="h-10 w-10" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {doc.name}
                    </p>
                    {activeDocuments.includes(doc.id) && (
                      <CheckCircleIcon className="ml-1 h-4 w-4 text-primary-500" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.doc_type || 'Document'} • {formatDate(doc.created_at || doc.upload_date)}
                    </p>
                  </div>
                  {doc.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="ml-2 flex-shrink-0 flex">
                <button
                  onClick={() => toggleActiveDocument(doc.id)}
                  className={`mr-2 p-1.5 rounded-md ${
                    activeDocuments.includes(doc.id)
                      ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                  title={activeDocuments.includes(doc.id) ? "Remove from active documents" : "Add to active documents"}
                >
                  {activeDocuments.includes(doc.id) ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={() => handleDelete(doc.id)}
                  className={`p-1.5 rounded-md ${
                    confirmDelete === doc.id
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                  title={confirmDelete === doc.id ? "Click again to confirm deletion" : "Delete document"}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;
