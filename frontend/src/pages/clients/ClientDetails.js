import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

const ClientDetails = () => {
  const { id } = useParams();
  // Mock client data - replace with API call
  const client = {
    id: id,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    address: '123 Main St, Anytown, USA 12345',
    cases: [
      { id: 101, title: 'Smith vs. Jones', status: 'Active' },
      { id: 105, title: 'Doe Estate Planning', status: 'Closed' },
    ],
    notes: 'Initial consultation on 2023-10-15. Interested in corporate law services.',
  };

  if (!client) {
    return <div>Loading client details...</div>; // Or a proper loading state
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <Link to="/clients" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Clients List
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Client Details: {client.name}</h2>
        </div>
        <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700">
          <PencilIcon className="h-4 w-4 mr-2" /> Edit Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contact Information</h3>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <PhoneIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
            <MapPinIcon className="h-5 w-5 mr-2 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span>{client.address}</span>
          </div>
        </div>

        {/* Associated Cases */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Associated Cases</h3>
          <ul className="space-y-2">
            {client.cases.map(c => (
              <li key={c.id} className="text-sm">
                <Link to={`/cases/${c.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">{c.title}</Link>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notes */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notes</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{client.notes}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
