import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  PencilIcon,
  BookOpenIcon,
  UserIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(`/api/documents/${id}/`);
        setDocument(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch document details:', err);
        setError('Failed to load document details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocumentDetails();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await apiRequest(`/api/documents/${id}/`, 'DELETE');
      navigate('/documents');
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError('Failed to delete document. Please try again.');
    }
    setShowDeleteModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = () => {
    if (!document) return null;
    
    const extension = document.name.split('.').pop().toLowerCase();
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
    
    return <DocumentIcon className={`h-12 w-12 ${iconClass}`} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        Document not found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <Link to="/documents" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Documents
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Document Details</h2>
        </div>
        <div className="flex space-x-2">
          <a 
            href={document.file} 
            download
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Download
          </a>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
          >
            <TrashIcon className="h-4 w-4 mr-2" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Document Preview/Icon */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {getFileIcon()}
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{document.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{document.file_size || 'N/A'}</p>
          
          {/* Simple document preview based on type */}
          {document.file && document.name.match(/\.(jpg|jpeg|png|gif)$/i) && (
            <img src={document.file} alt={document.name} className="mt-4 max-w-full h-auto rounded-md shadow" />
          )}
          
          {document.file && document.name.match(/\.(pdf)$/i) && (
            <div className="mt-4 w-full">
              <a 
                href={document.file} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                View PDF
              </a>
            </div>
          )}
        </div>

        {/* Document Metadata */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Document Information</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="col-span-1 md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {document.description || 'No description provided.'}
                </dd>
              </div>
              
              <div className="flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2 text-gray-400" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{formatDate(document.uploaded_at)}</dd>
                </div>
              </div>
              
              <div className="flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2 text-gray-400" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Modified</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{formatDate(document.updated_at)}</dd>
                </div>
              </div>
              
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded By</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {document.uploaded_by_name || 'N/A'}
                  </dd>
                </div>
              </div>
              
              <div className="flex items-center">
                <FolderIcon className="h-5 w-5 mr-2 text-gray-400" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Associated Case</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {document.case ? (
                      <Link to={`/cases/${document.case}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                        {document.case_title || `Case #${document.case}`}
                      </Link>
                    ) : (
                      'Not associated with a case'
                    )}
                  </dd>
                </div>
              </div>
              
              {document.doc_type && (
                <div className="flex items-center">
                  <DocumentIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Document Type</dt>
                    <dd className="text-sm text-gray-900 dark:text-white capitalize">
                      {document.doc_type}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/documents/${id}/edit`}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
              >
                <PencilIcon className="h-4 w-4 mr-2" /> Edit Document
              </Link>
              
              {/* Additional actions could be added here */}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete the document "{document.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetails;
