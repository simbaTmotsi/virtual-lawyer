import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentIcon, 
  PlusIcon, 
  FolderIcon, 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    caseId: '',
    clientId: '',
    docType: ''
  });
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        let url = '/api/documents/';
        
        // Add query parameters for filtering
        const params = new URLSearchParams();
        if (filter.caseId) params.append('caseId', filter.caseId);
        if (filter.clientId) params.append('clientId', filter.clientId);
        if (filter.docType) params.append('docType', filter.docType);
        if (searchTerm) params.append('search', searchTerm);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await apiRequest(url);
        setDocuments(response || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
        setError('Failed to load documents. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFilters = async () => {
      try {
        // Fetch cases and clients for filters
        const [casesResponse, clientsResponse] = await Promise.all([
          apiRequest('/api/cases/'),
          apiRequest('/api/clients/')
        ]);
        
        setCases(casesResponse || []);
        setClients(clientsResponse || []);
      } catch (err) {
        console.error('Failed to fetch filter data:', err);
      }
    };

    fetchDocuments();
    fetchFilters();
  }, [filter, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilter({
      caseId: '',
      clientId: '',
      docType: ''
    });
    setSearchTerm('');
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    // Return appropriate icon class based on file type
    switch (extension) {
      case 'pdf':
        return 'text-red-500';
      case 'doc':
      case 'docx':
        return 'text-blue-500';
      case 'xls':
      case 'xlsx':
        return 'text-green-500';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Documents</h2>
        <Link
          to="/documents/upload"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Upload Document
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="document-search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Search documents by name or description..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div>
            <select
              id="document-filter-case"
              name="caseId"
              value={filter.caseId}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Cases</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              id="document-filter-client"
              name="clientId"
              value={filter.clientId}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{`${client.first_name} ${client.last_name}`}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-1 md:col-span-3">
            <select
              id="document-filter-type"
              name="docType"
              value={filter.docType}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Document Types</option>
              <option value="legal">Legal Document</option>
              <option value="contract">Contract</option>
              <option value="court">Court Filing</option>
              <option value="correspondence">Correspondence</option>
              <option value="evidence">Evidence</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="flex justify-end items-center">
            <button
              onClick={clearFilters}
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-8 text-center">
            <FolderIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {Object.values(filter).some(f => f) || searchTerm 
                ? 'Try adjusting your search or filters'
                : 'Get started by uploading your first document'}
            </p>
            {!Object.values(filter).some(f => f) && !searchTerm && (
              <div className="mt-6">
                <Link
                  to="/documents/upload"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Document
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Associated Case</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Uploaded By</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Uploaded Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Size</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentIcon className={`h-5 w-5 mr-3 ${getFileIcon(doc.name)}`} />
                        <div>
                          <Link to={`/documents/${doc.id}`} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">{doc.name}</Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{doc.description ? doc.description.substring(0, 50) + (doc.description.length > 50 ? '...' : '') : 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.case ? (
                        <Link to={`/cases/${doc.case}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">{doc.case_title || `Case #${doc.case}`}</Link>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Not associated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {doc.uploaded_by_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatDate(doc.uploaded_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {doc.file_size || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href={doc.file} 
                        download
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-200 inline-flex items-center"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsList;
