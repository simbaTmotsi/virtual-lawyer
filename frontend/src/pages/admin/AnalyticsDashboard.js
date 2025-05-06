import React, { useState, useEffect } from 'react';
import { ChartBarIcon, UsersIcon, DocumentDuplicateIcon, ClockIcon } from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';

// Placeholder for chart component (e.g., using Chart.js)
const PlaceholderChart = ({ title, data }) => (
  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
    <p className="text-gray-500 dark:text-gray-400">{title} Chart Area</p>
  </div>
);

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    stats: [],
    userSignups: [],
    apiUsage: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // Fetch summary stats
        const stats = await apiRequest('/api/analytics/summary/');
        
        // Fetch user signup data for chart
        const userSignups = await apiRequest('/api/analytics/user-signups/');
        
        // Fetch API usage data for chart
        const apiUsage = await apiRequest('/api/analytics/api-usage/');
        
        setAnalyticsData({
          stats: stats || [],
          userSignups: userSignups || [],
          apiUsage: apiUsage || []
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

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

  // Map stats to their icons and colors
  const statsWithIcons = analyticsData.stats.map(stat => {
    const icons = {
      'Total Users': UsersIcon,
      'Active Users (24h)': UsersIcon,
      'Documents Processed': DocumentDuplicateIcon,
      'Avg. API Response Time': ClockIcon
    };
    
    const colors = {
      'Total Users': 'bg-blue-500',
      'Active Users (24h)': 'bg-green-500',
      'Documents Processed': 'bg-indigo-500',
      'Avg. API Response Time': 'bg-yellow-500'
    };
    
    return {
      ...stat,
      icon: icons[stat.name] || UsersIcon,
      color: colors[stat.name] || 'bg-gray-500'
    };
  });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        View system usage, performance metrics, and user activity.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsWithIcons.map((stat) => (
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
          <PlaceholderChart title="User Signups" data={analyticsData.userSignups} />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-500" /> API Usage by Endpoint
          </h3>
          <PlaceholderChart title="API Usage" data={analyticsData.apiUsage} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
