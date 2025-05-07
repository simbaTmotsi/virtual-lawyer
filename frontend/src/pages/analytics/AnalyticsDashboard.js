import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  BriefcaseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import ChartComponent from '../../components/charts/ChartComponent';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    stats: [],
    caseMetrics: null,
    timeTracking: null,
    billingOverview: null,
    activityTimeline: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Default to last 30 days
  const [period, setPeriod] = useState('30d');
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    setRefreshing(true);
    
    try {
      // Fetch analytics data
      const stats = await apiRequest('/api/analytics/stats/');
      
      // Fetch case metrics
      const caseMetrics = await apiRequest(`/api/analytics/cases/?period=${period}`);
      
      // Fetch time tracking data
      const timeTracking = await apiRequest(`/api/analytics/time-tracking/?period=${period}`);
      
      // Fetch billing overview
      const billingOverview = await apiRequest(`/api/analytics/billing/?period=${period}`);
      
      // Set the data
      setAnalyticsData({
        stats: stats || [],
        caseMetrics,
        timeTracking,
        billingOverview,
        activityTimeline: null // We'll add this later
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <button 
              onClick={() => setPeriod('7d')}
              className={`px-3 py-1 text-sm ${period === '7d' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            >
              7D
            </button>
            <button 
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1 text-sm ${period === '30d' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            >
              30D
            </button>
            <button 
              onClick={() => setPeriod('90d')}
              className={`px-3 py-1 text-sm ${period === '90d' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            >
              90D
            </button>
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
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsData.stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-primary-500 p-3">
                  {stat.name.includes('Case') && <BriefcaseIcon className="h-6 w-6 text-white" />}
                  {stat.name.includes('Time') && <ClockIcon className="h-6 w-6 text-white" />}
                  {stat.name.includes('Revenue') && <CurrencyDollarIcon className="h-6 w-6 text-white" />}
                  {!stat.name.includes('Case') && !stat.name.includes('Time') && !stat.name.includes('Revenue') && <ChartBarIcon className="h-6 w-6 text-white" />}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Case Metrics */}
      {analyticsData.caseMetrics && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Case Metrics</h3>
          <div className="h-80">
            <ChartComponent 
              type="bar"
              data={analyticsData.caseMetrics}
            />
          </div>
        </div>
      )}
      
      {/* Time Tracking */}
      {analyticsData.timeTracking && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Time Tracking</h3>
          <div className="h-80">
            <ChartComponent 
              type="line"
              data={analyticsData.timeTracking}
            />
          </div>
        </div>
      )}
      
      {/* Billing Overview */}
      {analyticsData.billingOverview && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Billing Overview</h3>
          <div className="h-80">
            <ChartComponent 
              type="bar"
              data={analyticsData.billingOverview}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
