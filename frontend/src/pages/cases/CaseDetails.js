import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, UserCircleIcon, CalendarIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';

const CaseDetails = () => {
  const { id } = useParams();
  // Mock case data - replace with API call
  const caseData = {
    id: id,
    title: 'Williams v. Northern Hospital',
    client: { id: 1, name: 'Sarah Williams' },
    type: 'Medical Malpractice',
    status: 'Active',
    description: 'Claim regarding negligent post-operative care leading to complications.',
    assignedAttorney: { id: 10, name: 'Alice Brown' },
    startDate: '2023-08-01',
    keyDates: [
      { date: '2023-11-20', event: 'Discovery Deadline' },
      { date: '2023-12-05', event: 'Motion Hearing' },
    ],
    documents: [
      { id: 201, name: 'Complaint.pdf', uploaded: '2023-08-05' },
      { id: 205, name: 'Medical Records Summary.docx', uploaded: '2023-10-10' },
    ],
    recentActivity: [
      { date: '2023-11-15', action: 'Filed motion for summary judgment' },
      { date: '2023-11-10', action: 'Deposition of Dr. Smith completed' },
    ],
  };

  if (!caseData) {
    return <div>Loading case details...</div>; // Or a proper loading state
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <Link to="/cases" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Cases List
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Case Details: {caseData.title}</h2>
        </div>
        <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700">
          <PencilIcon className="h-4 w-4 mr-2" /> Edit Case
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Core Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Case Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Client:</dt>
                <dd className="text-gray-900 dark:text-white"><Link to={`/clients/${caseData.client.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">{caseData.client.name}</Link></dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Type:</dt>
                <dd className="text-gray-900 dark:text-white">{caseData.type}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Status:</dt>
                <dd>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      caseData.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      caseData.status === 'Closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {caseData.status}
                    </span>
                </dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Assigned Attorney:</dt>
                <dd className="text-gray-900 dark:text-white">{caseData.assignedAttorney.name}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Start Date:</dt>
                <dd className="text-gray-900 dark:text-white">{caseData.startDate}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{caseData.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Recent Activity</h3>
            <ul className="space-y-2">
              {caseData.recentActivity.map((activity, index) => (
                <li key={index} className="flex items-center text-sm">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-gray-500 dark:text-gray-400 mr-2">{activity.date}:</span>
                  <span className="text-gray-700 dark:text-gray-300">{activity.action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Dates & Documents */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" /> Key Dates
            </h3>
            <ul className="space-y-2">
              {caseData.keyDates.map((date, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{date.date}:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{date.event}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-500" /> Documents
            </h3>
            <ul className="space-y-2">
              {caseData.documents.map((doc) => (
                <li key={doc.id} className="text-sm flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <Link to={`/documents/${doc.id}`} className="text-primary-600 dark:text-primary-400 hover:underline truncate flex-1">{doc.name}</Link>
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">({doc.uploaded})</span>
                </li>
              ))}
            </ul>
            <Link to={`/documents?caseId=${id}`} className="mt-3 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline">View All Documents</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
