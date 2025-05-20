import React, { useState, useRef } from 'react';
import { DocumentPlusIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * A reusable document upload widget that supports drag-and-drop 
 * and file selection with upload progress indicator
 */
const DocumentUploadWidget = ({ onUpload, isUploading = false, allowedFileTypes = [] }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);
  
  // Calculate the allowed file types string for the file input
  const fileTypesString = allowedFileTypes.length > 0 
    ? allowedFileTypes.map(type => `.${type}`).join(',') 
    : undefined;
  
  // Format allowed types for display
  const formattedAllowedTypes = allowedFileTypes.length > 0 
    ? allowedFileTypes.join(', ').toUpperCase() 
    : "All files";

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
    // If no file types are specified, accept all files
    if (allowedFileTypes.length === 0) return true;
    
    // Get file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return allowedFileTypes.includes(fileExtension);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setFileError('');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onUpload(file);
      } else {
        setFileError(`Invalid file type. Please upload ${formattedAllowedTypes} files only.`);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setFileError('');
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onUpload(file);
      } else {
        setFileError(`Invalid file type. Please upload ${formattedAllowedTypes} files only.`);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="mb-4">
      {fileError && (
        <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-md flex items-center">
          <XMarkIcon className="h-4 w-4 mr-1" />
          {fileError}
        </div>
      )}
      
      <div 
        className={`border-2 border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer transition-colors
          ${dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden"
          accept={fileTypesString}
          onChange={handleChange}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center text-gray-600 dark:text-gray-400 py-4">
            <ArrowPathIcon className="h-6 w-6 mb-2 animate-spin text-primary-500" />
            <p className="text-sm text-center">Uploading document...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-600 dark:text-gray-400 py-4">
            <DocumentPlusIcon className="h-6 w-6 mb-2 text-primary-500" />
            <p className="text-sm font-medium">Drag a document here, or click to select</p>
            {allowedFileTypes.length > 0 && (
              <p className="text-xs mt-1">{`Accepts: ${formattedAllowedTypes}`}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadWidget;
