import React from 'react';
import { ChartBarIcon, UsersIcon, DocumentDuplicateIcon, ClockIcon } from '@heroicons/react/24/outline';

// Placeholder for chart component (e.g., using Chart.js)
const PlaceholderChart = ({ title }) => (
  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
    <p className="text-gray-500 dark:text-gray-400">{title} Chart Area</p>
  </div>
);

const AnalyticsDashboard = () => {
  // Mock analytics data - replace with API calls
  const stats = [
    { name: 'Total Users', value: '152', icon: UsersIcon, color: 'bg-blue-500' },
    { name: 'Active Users (24h)', value: '45', icon: UsersIcon, color: 'bg-green-500' },
    { name: 'Documents Processed', value: '1,280', icon: DocumentDuplicateIcon, color: 'bg-indigo-500' },
    { name: 'Avg. API Response Time', value: '120ms', icon: ClockIcon, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        View system usage, performance metrics, and user activity.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md ${stat.color} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.name}</dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-500" /> User Signups Over Time
          </h3>
          <PlaceholderChart title="User Signups" />
        </div>
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-500" /> API Usage by Endpoint
          </h3>
          <PlaceholderChart title="API Usage" />
        </div>
      </div>

      {/* More detailed sections can be added here */}
      {/* e.g., Recent Errors, Slowest API Calls, Resource Usage */}

    </div>
  );
};

export default AnalyticsDashboard;
