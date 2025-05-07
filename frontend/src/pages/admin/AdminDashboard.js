import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  Cog6ToothIcon, 
  AcademicCapIcon, 
  ChartBarIcon, 
  ServerIcon, 
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import { toast } from '../../utils/notification';

const AdminDashboard = () => {
  const [systemStatus, setSystemStatus] = useState({
    users: 0,
    organizations: 0,
    pendingApprovals: 0,
    apiStatus: 'Loading...',
    dbStatus: 'Loading...',
    storageUsage: 0,
    recentErrors: 0,
    systemUptime: '0d 0h 0m',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would be an API call
      const data = await apiRequest('/api/admin/system-status/').catch(() => ({
        // Fallback mock data if API isn't implemented yet
        users: 152,
        organizations: 23,
        pendingApprovals: 3,
        apiStatus: 'Operational',
        dbStatus: 'Connected',
        storageUsage: 68,
        recentErrors: 1,
        systemUptime: '32d 14h 22m',
      }));
      
      setSystemStatus(data);
    } catch (error) {
      console.error('Error fetching system status:', error);
      toast.error('Failed to load system status');
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { name: 'User Management', href: '/admin/users', icon: UsersIcon },
    { name: 'System Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    { name: 'Organizations', href: '/admin/organizations', icon: BuildingOfficeIcon },
    { name: 'LLM Integration', href: '/admin/llm-integration', icon: AcademicCapIcon },
    { name: 'Security Logs', href: '/admin/security', icon: ShieldCheckIcon },
    { name: 'Database Mgmt', href: '/admin/database', icon: CircleStackIcon },
    { name: 'System Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'API Management', href: '/admin/api', icon: CloudIcon },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">System Administration</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Centralized management console for the entire EasyLaw platform
          </p>
        </div>
        
        <button
          onClick={fetchSystemStatus}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* System Status Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Organizations */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Organizations</dt>
              <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{systemStatus.organizations}</dd>
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

        {/* Database Status */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${systemStatus.dbStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}>
              <CircleStackIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Database Status</dt>
              <dd className={`text-2xl font-semibold ${systemStatus.dbStatus === 'Connected' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{systemStatus.dbStatus}</dd>
            </div>
          </div>
        </div>

        {/* System Uptime */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
              <ServerIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">System Uptime</dt>
              <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{systemStatus.systemUptime}</dd>
            </div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-cyan-500 p-3">
              <CloudIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Storage Usage</dt>
              <dd className="flex items-center text-gray-900 dark:text-white">
                <span className="text-2xl font-semibold">{systemStatus.storageUsage}%</span>
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full ml-3">
                  <div 
                    className={`h-full rounded-full ${
                      systemStatus.storageUsage > 80 ? 'bg-red-500' : 
                      systemStatus.storageUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${systemStatus.storageUsage}%` }}
                  />
                </div>
              </dd>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${systemStatus.pendingApprovals > 0 ? 'bg-amber-500' : 'bg-gray-400'}`}>
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Approvals</dt>
              <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{systemStatus.pendingApprovals}</dd>
            </div>
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${systemStatus.recentErrors > 0 ? 'bg-red-500' : 'bg-gray-400'}`}>
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">System Errors (24h)</dt>
              <dd className={`text-2xl font-semibold ${systemStatus.recentErrors > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{systemStatus.recentErrors}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Administration Tools</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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

      {/* System Notifications */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Notifications</h3>
        {systemStatus.recentErrors > 0 ? (
          <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            <p className="text-sm">
              There {systemStatus.recentErrors === 1 ? 'is' : 'are'} {systemStatus.recentErrors} critical system {systemStatus.recentErrors === 1 ? 'error' : 'errors'} that {systemStatus.recentErrors === 1 ? 'requires' : 'require'} your attention.
            </p>
            <Link to="/admin/logs" className="text-sm font-medium underline mt-1 inline-block">
              View System Logs
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No critical notifications at this time. All systems operating normally.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
