import React, { useState, useRef } from 'react';
import { DocumentArrowUpIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const DocumentUploader = ({ onUpload, onCancel, isLoading }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const validateFile = (file) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: `File "${file.name}" exceeds the 10MB size limit.`
      };
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File "${file.name}" has an unsupported format. Please upload PDF, Word, text, or image files.`
      };
    }
    
    return {
      isValid: true
    };
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  const processFiles = (fileList) => {
    const newErrors = [];
    const validFiles = [];
    
    Array.from(fileList).forEach(file => {
      const validation = validateFile(file);
      
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        newErrors.push(validation.error);
      }
    });
    
    setFiles(prev => [...prev, ...validFiles]);
    
    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors]);
    }
  };
  
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const clearErrors = () => {
    setErrors([]);
  };
  
  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files);
    }
  };
  
  const getFileIcon = (file) => {
    const fileType = file.type;
    
    if (fileType.includes('pdf')) {
      return <span className="text-red-500">PDF</span>;
    } else if (fileType.includes('word')) {
      return <span className="text-blue-500">DOC</span>;
    } else if (fileType.includes('text')) {
      return <span className="text-gray-500">TXT</span>;
    } else if (fileType.includes('image')) {
      return <span className="text-green-500">IMG</span>;
    } else {
      return <span className="text-gray-500">FILE</span>;
    }
  };
  
  return (
    <div className="document-uploader bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      {/* Errors display */}
      {errors.length > 0 && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 rounded-md p-3">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 dark:text-red-300 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                There were {errors.length} errors with your submission
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <button
                  onClick={clearErrors}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Drag & Drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
          dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        />
        
        <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span className="font-medium text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop
        </p>
        
        <p className="text-xs text-gray-500 dark:text-gray-500">
          PDF, Word, Text, or Images up to 10MB
        </p>
      </div>
      
      {/* Selected files list */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selected Files ({files.length})
          </h4>
          
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <li key={index} className="py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 mr-2">
                    {getFileIcon(file)}
                  </span>
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        
        <button
          type="button"
          onClick={handleUpload}
          disabled={files.length === 0 || isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-1" />
              Upload {files.length} file{files.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentUploader;
