import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  DocumentIcon, 
  ExclamationCircleIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';

const UploadDocument = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [caseId, setCaseId] = useState('');
  const [docType, setDocType] = useState('');
  const [cases, setCases] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Fetch cases for association
    const fetchCases = async () => {
      try {
        const response = await apiRequest('/api/cases/');
        setCases(response || []);
      } catch (err) {
        console.error('Failed to fetch cases:', err);
      }
    };

    fetchCases();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-fill document name from filename
      const fileName = selectedFile.name;
      if (!documentName) {
        // Remove file extension and replace underscores/hyphens with spaces
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
          .replace(/[_-]/g, ' ');
        setDocumentName(nameWithoutExt);
      }
      
      // Create file preview if it's an image
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!documentName.trim()) {
      setError('Please provide a document name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', documentName);
      formData.append('description', description);
      if (caseId) formData.append('case', caseId);
      if (docType) formData.append('doc_type', docType);
      
      // Custom headers for FormData
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };
      
      await apiRequest('/api/documents/', 'POST', formData, config);
      navigate('/documents');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    const extension = file.name.split('.').pop().toLowerCase();
    let iconClass = 'text-gray-500';
    
    // Return appropriate icon class based on file type
    switch (extension) {
      case 'pdf':
        iconClass = 'text-red-500';
        break;
      case 'doc':
      case 'docx':
        iconClass = 'text-blue-500';
        break;
      case 'xls':
      case 'xlsx':
        iconClass = 'text-green-500';
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
        iconClass = 'text-purple-500';
        break;
      default:
        iconClass = 'text-gray-500';
    }
    
    return <DocumentIcon className={`h-16 w-16 ${iconClass}`} />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/documents" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mb-2">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Documents
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload Document</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag & drop file upload area */}
        <div 
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
            dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            {file ? (
              <div className="flex flex-col items-center">
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="h-32 w-auto object-contain mb-4 rounded" 
                  />
                ) : (
                  getFileIcon()
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, Word, Excel, images, up to 10MB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Document details */}
        <div>
          <label htmlFor="upload-document-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Document Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="upload-document-name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="upload-document-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="upload-document-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="upload-document-case-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Associate with Case
          </label>
          <select
            id="upload-document-case-id"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="">None</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>{c.title || `Case #${c.id}`}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="upload-document-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Document Type
          </label>
          <select
            id="upload-document-type"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select Type</option>
            <option value="legal">Legal Document</option>
            <option value="contract">Contract</option>
            <option value="court">Court Filing</option>
            <option value="correspondence">Correspondence</option>
            <option value="evidence">Evidence</option>
            <option value="other">Other</option>
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3 flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" aria-hidden="true" />
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Upload progress */}
        {loading && (
          <div className="mt-2">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200 dark:bg-primary-900 dark:text-primary-200">
                    Uploading
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200 dark:bg-gray-700">
                <div 
                  style={{ width: `${uploadProgress}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5 mr-2" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadDocument;
