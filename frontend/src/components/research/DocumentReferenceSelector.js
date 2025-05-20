import React, { useState, useRef, useEffect } from 'react';
import { DocumentTextIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

/**
 * Component for selecting which documents to reference in a research query
 * Allows users to select multiple documents to provide context for their queries
 */
const DocumentReferenceSelector = ({ documents, selectedDocuments, setSelectedDocuments }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleDocumentSelect = (docId) => {
    // Check if document is already selected
    if (selectedDocuments.includes(docId)) {
      setSelectedDocuments(selectedDocuments.filter(id => id !== docId));
    } else {
      setSelectedDocuments([...selectedDocuments, docId]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
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
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`inline-flex items-center bg-white dark:bg-gray-700 border rounded-md px-3 py-1.5 text-sm
          ${selectedDocuments.length > 0 
            ? 'border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300' 
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
      >
        <DocumentTextIcon className="h-4 w-4 mr-1" />
        {selectedDocuments.length === 0 ? (
          'Reference Documents'
        ) : (
          `${selectedDocuments.length} Document${selectedDocuments.length !== 1 ? 's' : ''}`
        )}
        {isOpen ? (
          <ChevronUpIcon className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDownIcon className="ml-1 h-4 w-4" />
        )}
      </button>

      {/* Selected documents list - shown as pills below the dropdown */}
      {selectedDocuments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedDocuments.map(docId => {
            const doc = documents.find(d => d.id === docId);
            if (!doc) return null;
            
            return (
              <div 
                key={docId}
                className="inline-flex items-center bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full pl-2 pr-1 py-1 text-xs"
              >
                <DocumentTextIcon className={`h-3 w-3 mr-1 ${getFileIcon(doc.name)}`} />
                <span className="truncate max-w-[150px]">{doc.name}</span>
                <button 
                  type="button"
                  onClick={() => handleDocumentSelect(docId)}
                  className="ml-1 p-0.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
          {documents.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No documents available
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map(doc => (
                <li key={doc.id} className="px-2">
                  <button
                    type="button"
                    onClick={() => handleDocumentSelect(doc.id)}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md ${
                      selectedDocuments.includes(doc.id)
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <DocumentTextIcon className={`h-4 w-4 mr-2 ${getFileIcon(doc.name)}`} />
                      <div className="overflow-hidden">
                        <div className="font-medium truncate">{doc.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(doc.created_at)}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentReferenceSelector;
