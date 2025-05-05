import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

const SystemSettings = () => {
  // Mock settings state - replace with API integration
  const [settings, setSettings] = useState({
    appName: 'EasyLaw',
    defaultTimezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    maintenanceMode: false,
    allowRegistrations: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSuccess(false); // Reset success message on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      // Simulate API call to save settings
      console.log('Saving settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Handle error display
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">System Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {/* Application Name */}
        <div>
          <label htmlFor="appName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Application Name
          </label>
          <input
            type="text"
            id="appName"
            name="appName"
            value={settings.appName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Default Timezone */}
        <div>
          <label htmlFor="defaultTimezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Default Timezone
          </label>
          <select
            id="defaultTimezone"
            name="defaultTimezone"
            value={settings.defaultTimezone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
            {/* Add more timezones as needed */}
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST/EDT)</option>
            <option value="America/Chicago">America/Chicago (CST/CDT)</option>
            <option value="America/Denver">America/Denver (MST/MDT)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
          </select>
        </div>

        {/* Date Format */}
        <div>
          <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Format
          </label>
          <select
            id="dateFormat"
            name="dateFormat"
            value={settings.dateFormat}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2023-11-16)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 11/16/2023)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 16/11/2023)</option>
            <option value="MMM D, YYYY">MMM D, YYYY (e.g., Nov 16, 2023)</option>
          </select>
        </div>

        {/* Maintenance Mode */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="maintenanceMode"
              name="maintenanceMode"
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="maintenanceMode" className="font-medium text-gray-700 dark:text-gray-300">
              Enable Maintenance Mode
            </label>
            <p className="text-gray-500 dark:text-gray-400">Temporarily disable access for non-admin users.</p>
          </div>
        </div>

        {/* Allow Registrations */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="allowRegistrations"
              name="allowRegistrations"
              type="checkbox"
              checked={settings.allowRegistrations}
              onChange={handleChange}
              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="allowRegistrations" className="font-medium text-gray-700 dark:text-gray-300">
              Allow New User Registrations
            </label>
            <p className="text-gray-500 dark:text-gray-400">Control whether new users can sign up.</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
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
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          {success && (
            <span className="text-sm text-green-600 dark:text-green-400">Settings saved successfully!</span>
          )}
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
