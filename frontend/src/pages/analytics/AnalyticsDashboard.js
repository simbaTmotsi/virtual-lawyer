import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  BriefcaseIcon,
  ArrowPathIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import ChartComponent from '../../components/charts/ChartComponent';
import { useAuth } from '../../contexts/AuthContext';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    stats: [],
    caseMetrics: null,
    timeTracking: null,
    billingOverview: null,
    performanceComparison: null,
    clientDistribution: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [showingPersonal, setShowingPersonal] = useState(true);

  // Load lawyers list for the filter dropdown
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        // Use mock data instead of API call for now
        const mockLawyers = [
          { id: '1', first_name: 'John', last_name: 'Smith', role: 'attorney' },
          { id: '2', first_name: 'Sarah', last_name: 'Johnson', role: 'attorney' },
          { id: '3', first_name: 'Michael', last_name: 'Williams', role: 'attorney' }
        ];
        
        setLawyers(mockLawyers);
        
        // Simulate the current user as the first attorney
        setSelectedLawyer('1');
        setShowingPersonal(true);
      } catch (err) {
        console.error('Failed to fetch lawyers:', err);
      }
    };
    
    fetchLawyers();
  }, [user]);

  useEffect(() => {
    if (selectedLawyer) {
      fetchAnalyticsData();
    }
  }, [period, selectedLawyer]);

  const fetchAnalyticsData = async () => {
    setRefreshing(true);
    
    try {
      // Use mock data instead of API calls
      const stats = [
        {
          name: 'Active Cases',
          value: '7',
          change: '+2'
        },
        {
          name: 'Billable Hours',
          value: '42 hrs',
          change: '+8%'
        },
        {
          name: 'Monthly Revenue',
          value: '$12,450',
          change: '+15%'
        },
        {
          name: 'Client Satisfaction',
          value: '94%',
          change: '+3%'
        }
      ];
      
      const caseMetrics = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Hours Billed',
            data: [12, 15, 8, 7],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)'
          },
          {
            label: 'Cases Closed',
            data: [1, 0, 2, 1],
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgb(16, 185, 129)'
          }
        ]
      };
      
      const timeTracking = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Billable Hours',
            data: [28, 35, 20, 42],
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1,
            fill: false
          },
          {
            label: 'Non-Billable Hours',
            data: [10, 8, 12, 6],
            borderColor: 'rgb(209, 213, 219)',
            tension: 0.1,
            fill: false
          }
        ]
      };
      
      const clientDistribution = {
        labels: ['Client A', 'Client B', 'Client C', 'Client D', 'Other Clients'],
        datasets: [
          {
            label: 'Hours Worked',
            data: [18, 12, 10, 8, 15],
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(245, 158, 11, 0.7)',
              'rgba(139, 92, 246, 0.7)',
              'rgba(209, 213, 219, 0.7)'
            ]
          }
        ]
      };
      
      const billingOverview = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Billed',
            data: [12500, 15000, 11200, 18000, 9500, 12450],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)'
          },
          {
            label: 'Collected',
            data: [10000, 13500, 10200, 16000, 8500, 11000],
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgb(16, 185, 129)'
          }
        ]
      };
      
      const performanceComparison = {
        labels: [
          'Billable Hours', 
          'Case Completion', 
          'Client Retention',
          'Revenue Generation',
          'Efficiency'
        ],
        datasets: [
          {
            label: 'Your Performance',
            data: [85, 78, 92, 80, 88],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff'
          },
          {
            label: 'Firm Average',
            data: [70, 65, 75, 68, 72],
            backgroundColor: 'rgba(107, 114, 128, 0.2)',
            borderColor: 'rgb(107, 114, 128)',
            pointBackgroundColor: 'rgb(107, 114, 128)',
            pointBorderColor: '#fff'
          },
          {
            label: 'Top Performers',
            data: [95, 88, 96, 92, 95],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgb(16, 185, 129)',
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff'
          }
        ]
      };
      
      setAnalyticsData({
        stats,
        caseMetrics,
        timeTracking,
        billingOverview,
        clientDistribution,
        performanceComparison
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch attorney analytics data:', err);
      setError('Failed to load attorney analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLawyerChange = (e) => {
    setSelectedLawyer(e.target.value);
    setShowingPersonal(e.target.value === '1'); // Assuming '1' is the current user
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

  // Find the selected lawyer's name
  const selectedLawyerObj = lawyers.find(l => l.id === selectedLawyer);
  const selectedLawyerName = selectedLawyerObj ? 
    `${selectedLawyerObj.first_name} ${selectedLawyerObj.last_name}` : 
    "Attorney";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
            <UserCircleIcon className="h-7 w-7 mr-2 text-primary-600" />
            {showingPersonal ? 'My Performance Analytics' : `Attorney Performance: ${selectedLawyerName}`}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Detailed metrics to track your productivity, revenue generation, and case performance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <select
              value={selectedLawyer || ''}
              onChange={handleLawyerChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {lawyers.map(lawyer => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.first_name} {lawyer.last_name}
                </option>
              ))}
            </select>
          </div>
          
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
            {refreshing ? (
              <>
                <span className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300">⟳</span>
                Refreshing...
              </>
            ) : (
              <>
                <span className="-ml-1 mr-2 h-4 w-4">⟳</span>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Personal Performance Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsData.stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700/10 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-primary-500 p-3">
                  {stat.name.includes('Case') && <BriefcaseIcon className="h-6 w-6 text-white" />}
                  {stat.name.includes('Hours') && <ClockIcon className="h-6 w-6 text-white" />}
                  {stat.name.includes('Revenue') && <CurrencyDollarIcon className="h-6 w-6 text-white" />}
                  {!stat.name.includes('Case') && !stat.name.includes('Hours') && !stat.name.includes('Revenue') && <ChartBarIcon className="h-6 w-6 text-white" />}
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
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-2">
              <div className="flex items-center">
                <div className={`text-sm ${
                  stat.change.startsWith('+') 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                } flex items-center`}>
                  {stat.change} from previous period
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Time Tracking vs. Billing */}
      {analyticsData.timeTracking && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Billable Hours Breakdown</h3>
          <div className="h-80">
            <ChartComponent 
              type="line"
              data={analyticsData.timeTracking}
            />
          </div>
        </div>
      )}
      
      {/* Client Distribution */}
      {analyticsData.clientDistribution && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Client Distribution</h3>
          <div className="h-80">
            <ChartComponent 
              type="pie"
              data={analyticsData.clientDistribution}
            />
          </div>
        </div>
      )}
      
      {/* Case Types and Status */}
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
      
      {/* Revenue Generation */}
      {analyticsData.billingOverview && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Generation</h3>
          <div className="h-80">
            <ChartComponent 
              type="bar"
              data={analyticsData.billingOverview}
            />
          </div>
        </div>
      )}
      
      {/* Performance Comparison (anonymized) */}
      {analyticsData.performanceComparison && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Benchmarking</h3>
          <p className="text-sm text-gray-500 mb-4">How your performance compares to other attorneys (anonymized)</p>
          <div className="h-80">
            <ChartComponent 
              type="radar"
              data={analyticsData.performanceComparison}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
