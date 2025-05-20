import React, { useState } from 'react';
import { 
  DocumentPlusIcon, 
  DocumentTextIcon, 
  ArrowPathIcon, 
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

const DocumentManagement = ({ 
  documents, 
  activeDocuments,
  onUpload,
  onToggleActive,
  onDelete,
  loading,
  error
}) => {
  const [showUploader, setShowUploader] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  
  const fileInputRef = React.useRef(null);
  
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/tiff'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('Invalid file type. Please upload PDF, Word, Text, or common image formats.');
      return;
    }
    
    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File too large. Maximum size is 10MB.');
      return;
    }
    
    // Clear previous error
    setFileError(null);
    
    // Set file and populate document name if not already set
    setFile(selectedFile);
    if (!documentName) {
      setDocumentName(selectedFile.name);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setFileError('Please select a file to upload.');
      return;
    }
    
    if (!documentName) {
      setFileError('Please provide a document name.');
      return;
    }
    
    try {
      await onUpload(file, documentName, documentType);
      
      // Reset form
      setFile(null);
      setDocumentName('');
      setDocumentType('');
      setShowUploader(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      // Error will be handled by parent component
    }
  };
  
  const isDocumentActive = (documentId) => {
    return activeDocuments.some(doc => doc.document_id === documentId);
  };
  
  const formatDocumentType = (document) => {
    const type = document.document_type || document.type || 'Unknown';
    const extension = document.name?.split('.').pop() || '';
    
    return type !== 'Unknown' ? type : extension;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getFileIcon = (document) => {
    const name = document.name || document.original_filename || '';
    const extension = name.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return 'text-red-500';
      case 'doc':
      case 'docx':
        return 'text-blue-500';
      case 'txt':
      case 'md':
        return 'text-green-500';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'tiff':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h2>
          <button
            type="button"
            onClick={() => setShowUploader(!showUploader)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <DocumentPlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
            Upload
          </button>
        </div>
        
        {/* Upload Form */}
        {showUploader && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Upload Document</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="document-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Document Name
                </label>
                <input
                  type="text"
                  id="document-name"
                  value={documentName}
                  onChange={e => setDocumentName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter document name"
                />
              </div>
              
              <div>
                <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Document Type (Optional)
                </label>
                <select
                  id="document-type"
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select a type</option>
                  <option value="Case Law">Case Law</option>
                  <option value="Legislation">Legislation</option>
                  <option value="Legal Brief">Legal Brief</option>
                  <option value="Contract">Contract</option>
                  <option value="Court Filing">Court Filing</option>
                  <option value="Legal Article">Legal Article</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="document-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  File
                </label>
                <div className="mt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="document-file"
                    onChange={handleFileSelect}
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.tiff"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md"
                  >
                    <div className="space-y-1 text-center">
                      <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <span className="relative font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                          {file ? file.name : 'Upload a file'}
                        </span>
                        {!file && <p className="pl-1">or drag and drop</p>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        PDF, Word, Text, or Image up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {fileError && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3">
                  <div className="flex">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-300">{fileError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUploader(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4">
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Document list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active Documents ({activeDocuments.length})
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Currently providing context for your research
          </p>
        </div>
        
        {documents.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No documents available. Upload documents to begin research.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((document) => (
              <div 
                key={document.document_id || document.id} 
                className={`flex items-center p-3 rounded-md ${
                  isDocumentActive(document.document_id || document.id)
                    ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <DocumentTextIcon className={`h-5 w-5 mr-3 ${getFileIcon(document)}`} />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {document.name || document.original_filename}
                  </p>
                  <div className="flex text-xs text-gray-500 dark:text-gray-400">
                    <span className="truncate">
                      {formatDocumentType(document)}
                    </span>
                    <span className="mx-1">•</span>
                    <span>
                      {formatDate(document.created_at || document.upload_date)}
                    </span>
                  </div>
                </div>
                
                <div className="ml-3 flex-shrink-0 flex">
                  <button
                    type="button"
                    onClick={() => onToggleActive(document.document_id || document.id)}
                    className={`p-1 rounded-full ${
                      isDocumentActive(document.document_id || document.id)
                        ? 'text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300'
                        : 'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
                    }`}
                    title={isDocumentActive(document.document_id || document.id) ? 'Remove from active documents' : 'Add to active documents'}
                  >
                    {isDocumentActive(document.document_id || document.id) ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <PlusCircleIcon className="h-5 w-5" />
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => onDelete(document.document_id || document.id)}
                    className="ml-1 p-1 rounded-full text-red-400 hover:text-red-500"
                    title="Delete document"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManagement;
