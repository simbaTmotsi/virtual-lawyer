import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api'; // Import API utility

const ClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(`/api/clients/${id}/`); // Adjust endpoint as needed
        setClient(response);
        setError(null);
      } catch (err) {
        setError(err.message || `Failed to fetch client details for ID ${id}.`);
        console.error(`Failed to fetch client details for ID ${id}:`, err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClientDetails();
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
        <p className="text-gray-600 dark:text-gray-400">Could not load client details. Please try again later or check if the client ID is correct.</p>
      </div>
    );
  }

  if (!client) {
    return <div className="text-center py-10 text-gray-600 dark:text-gray-400">No client data found.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <Link to="/clients" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Clients List
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Client Details: {client.first_name} {client.last_name}</h2>
        </div>
        <Link 
          to={`/clients/${client.id}/edit`} // Assuming an edit route
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
        >
          <PencilIcon className="h-4 w-4 mr-2" /> Edit Client
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Client Info */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Full Name:</dt>
                <dd className="text-gray-900 dark:text-white">{client.first_name} {client.last_name}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500 dark:text-gray-400">Date Added:</dt>
                <dd className="text-gray-900 dark:text-white">{client.date_added ? new Date(client.date_added).toLocaleDateString() : 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>

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
            {client.cases && client.cases.length > 0 ? client.cases.map(c => (
              <li key={c.id} className="text-sm">
                <Link to={`/cases/${c.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">{c.title}</Link>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${c.status === 'Active' || c.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {c.status}
                </span>
              </li>
            )) : (
              <li className="text-sm text-gray-500 dark:text-gray-400">No associated cases.</li>
            )}
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
