import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UsersIcon, 
  DocumentDuplicateIcon, 
  ClockIcon,
  ArrowPathIcon,
  CalendarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import ChartComponent from '../../components/charts/ChartComponent';
import DateRangeSelector from '../../components/analytics/DateRangeSelector';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    stats: [],
    userSignups: null,
    apiUsage: null,
    caseDistribution: null,
    billingData: null,
    timeTracking: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Date range state
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const fetchAnalyticsData = async () => {
    try {
      setRefreshing(true);
      
      // Use the correct endpoint for admin stats
      const stats = await apiRequest('/api/analytics/summary/');
      
      // Fetch user signup data for chart with date range
      const userSignups = await apiRequest(`/api/analytics/user-signups/?start_date=${startDate}&end_date=${endDate}`);
      
      // Fetch API usage data for chart
      const apiUsage = await apiRequest('/api/analytics/api-usage/');
      
      // Fetch case distribution data
      const caseDistribution = await apiRequest('/api/analytics/case-distribution/');
      
      // Fetch billing analytics data with date range
      const billingData = await apiRequest(`/api/analytics/billing/?start_date=${startDate}&end_date=${endDate}`);
      
      // Fetch time tracking analytics
      const timeTracking = await apiRequest('/api/analytics/time-tracking/');
      
      setAnalyticsData({
        stats: stats || [],
        userSignups,
        apiUsage,
        caseDistribution,
        billingData,
        timeTracking
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate]);

  // Handle date range selection
  const handleRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && !analyticsData.stats.length) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View system usage, performance metrics, and user activity.
          </p>
        </div>
        
        {/* Date Range Selector */}
        <DateRangeSelector 
          startDate={startDate} 
          endDate={endDate} 
          onRangeChange={handleRangeChange} 
        />
      </div>

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
            <UsersIcon className="h-5 w-5 mr-2 text-primary-500" /> User Signups Over Time
          </h3>
          <ChartComponent 
            title="User Signups" 
            type="line" 
            data={analyticsData.userSignups} 
          />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-500" /> API Usage by Endpoint
          </h3>
          <ChartComponent 
            title="API Usage" 
            type="bar" 
            data={analyticsData.apiUsage} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <BriefcaseIcon className="h-5 w-5 mr-2 text-primary-500" /> Case Distribution by Type
          </h3>
          <ChartComponent 
            title="Case Distribution" 
            type="pie" 
            data={analyticsData.caseDistribution} 
          />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-primary-500" /> Time Tracking by Attorney
          </h3>
          <ChartComponent 
            title="Time Tracking" 
            type="bar" 
            data={analyticsData.timeTracking} 
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Data updated: {new Date().toLocaleString()}
        </div>
        <button 
          onClick={fetchAnalyticsData}
          disabled={refreshing}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowPathIcon className={`-ml-1 mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
