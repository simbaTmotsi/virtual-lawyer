import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  BookOpenIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api'; // Import API utility

const CaseDetails = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(`/api/cases/${id}/`); // Adjust endpoint as needed
        setCaseData(response);
        setError(null);
      } catch (err) {
        setError(err.message || `Failed to fetch case details for ID ${id}.`);
        console.error(`Failed to fetch case details for ID ${id}:`, err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCaseDetails();
    }
  }, [id]);

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
        <p className="text-red-500 text-lg">Error: {error}</p>
        <p className="text-gray-600 dark:text-gray-400">Could not load case details. Please try again later or check if the case ID is correct.</p>
      </div>
    );
  }

  if (!caseData) {
    return <div className="text-center py-10 text-gray-600 dark:text-gray-400">No case data found.</div>;
  }
  
  // Helper to format date strings
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <Link to="/cases" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Cases List
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Case Details: {caseData.title}</h2>
        </div>
        <Link 
          to={`/cases/${caseData.id}/edit`} // Assuming an edit route
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
        >
          <PencilIcon className="h-4 w-4 mr-2" /> Edit Case
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Core Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Case Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Case Number:</dt>
                <dd className="text-gray-900 dark:text-white">{caseData.case_number || 'N/A'}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Client:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {caseData.client_details ? (
                    <Link to={`/clients/${caseData.client_details.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                      {caseData.client_details.first_name} {caseData.client_details.last_name}
                    </Link>
                  ) : (caseData.client || 'N/A')}
                </dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Type:</dt>
                <dd className="text-gray-900 dark:text-white">{caseData.case_type || 'N/A'}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Status:</dt>
                <dd>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      caseData.status === 'Active' || caseData.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      caseData.status === 'Closed' || caseData.status === 'closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {caseData.status}
                    </span>
                </dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Assigned Attorneys:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {caseData.assigned_attorneys_details && caseData.assigned_attorneys_details.length > 0 
                    ? caseData.assigned_attorneys_details.map(attorney => `${attorney.first_name} ${attorney.last_name}`).join(', ') 
                    : 'N/A'}
                </dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Date Opened:</dt>
                <dd className="text-gray-900 dark:text-white">{formatDate(caseData.date_opened)}</dd>
              </div>
              {caseData.date_closed && (
                <div className="flex">
                  <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Date Closed:</dt>
                  <dd className="text-gray-900 dark:text-white">{formatDate(caseData.date_closed)}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{caseData.description || 'No description provided.'}</p>
          </div>

          {/* Placeholder for Recent Activity - this would typically come from related models like Audit Logs or Case Updates */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-primary-500" /> Recent Activity
            </h3>
            <ul className="space-y-2">
              {/* Mocked for now, replace with actual data if available from API */}
              <li className="text-sm text-gray-500 dark:text-gray-400">No recent activity logged for this case via API.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Dates & Documents - these would typically be separate API calls or nested data */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2 text-primary-500" /> Key Dates
            </h3>
            <ul className="space-y-2">
              {/* Mocked for now, replace with actual data (e.g., caseData.key_dates) */}
              <li className="text-sm text-gray-500 dark:text-gray-400">Key dates not yet available via API.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-500" /> Documents
            </h3>
            <ul className="space-y-2">
              {caseData.documents && caseData.documents.length > 0 ? (
                caseData.documents.map(doc => (
                  <li key={doc.id} className="flex items-center justify-between">
                    <Link to={`/documents/${doc.id}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      {doc.name}
                    </Link>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500 dark:text-gray-400">No documents attached to this case.</li>
              )}
              <li className="mt-2">
                <Link 
                  to={`/documents/upload?caseId=${caseData.id}`}
                  className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Document
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
