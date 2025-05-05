import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/solid';

const NewCase = () => {
  const navigate = useNavigate();
  const [caseTitle, setCaseTitle] = useState('');
  const [clientId, setClientId] = useState(''); // Assuming client selection
  const [description, setDescription] = useState('');
  const [caseType, setCaseType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock clients for dropdown - replace with API call
  const clients = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!caseTitle || !clientId || !caseType) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      // Simulate API call
      console.log('Submitting new case:', { caseTitle, clientId, description, caseType });
      await new Promise(resolve => setTimeout(resolve, 1000));
      // On success:
      navigate('/cases'); // Redirect to cases list
    } catch (err) {
      setError('Failed to create case. Please try again.');
      console.error('Case creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mb-2">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Add New Case</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Case Title */}
        <div>
          <label htmlFor="caseTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Case Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="caseTitle"
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Client Selection */}
        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Client <span className="text-red-500">*</span>
          </label>
          <select
            id="client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        {/* Case Type */}
        <div>
          <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Case Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="caseType"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            required
            placeholder="e.g., Personal Injury, Corporate Law"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3">
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
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
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <CheckIcon className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Saving...' : 'Save Case'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCase;
