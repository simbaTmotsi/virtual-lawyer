import React from 'react';
import { Link } from 'react-router-dom';
import { UsersIcon, Cog6ToothIcon, AcademicCapIcon, ChartBarIcon, ServerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  // Mock data - replace with API calls
  const systemStatus = {
    users: 152,
    pendingApprovals: 3,
    apiStatus: 'Operational',
    dbStatus: 'Connected',
    recentErrors: 1,
  };

  const quickLinks = [
    { name: 'User Management', href: '/admin/users', icon: UsersIcon },
    { name: 'System Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    { name: 'LLM Integration', href: '/admin/llm-integration', icon: AcademicCapIcon },
    { name: 'View Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Overview of system status, user activity, and quick access to administrative functions.
      </p>

      {/* System Status Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Users</dt>
              <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{systemStatus.users}</dd>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${systemStatus.apiStatus === 'Operational' ? 'bg-green-500' : 'bg-red-500'}`}>
              <ServerIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">API Status</dt>
              <dd className={`text-2xl font-semibold ${systemStatus.apiStatus === 'Operational' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{systemStatus.apiStatus}</dd>
            </div>
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${systemStatus.recentErrors > 0 ? 'bg-yellow-500' : 'bg-gray-500'}`}>
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Recent Errors (24h)</dt>
              <dd className={`text-2xl font-semibold ${systemStatus.recentErrors > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>{systemStatus.recentErrors}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="group flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700/10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              <link.icon className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Placeholder for recent activity feed or critical alerts */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Notifications</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No critical notifications at this time.</p>
        {/* Add logic to display important system messages or alerts */}
      </div>
    </div>
  );
};

export default AdminDashboard;
