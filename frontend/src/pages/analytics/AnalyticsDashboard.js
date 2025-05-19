import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  BriefcaseIcon,
  ArrowPathIcon,
  UserCircleIcon,
  CalendarIcon,
  ExclamationCircleIcon
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
    clientDistribution: null,
    upcomingDeadlines: []
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
  }, [period, selectedLawyer]);  const fetchAnalyticsData = async () => {
    setRefreshing(true);
    
    try {
      // Try to fetch real data from API endpoints
      let stats;
      
      try {
        // Fetch summary data from real API
        stats = await apiRequest('/api/analytics/summary/');
      } catch (err) {
        console.error('Could not fetch analytics summary:', err);
        // Fallback to mock data
        stats = [
          { name: 'Active Cases', value: '7', change: '+2', description: 'Cases currently in progress' },
          { name: 'Billable Hours (30d)', value: '42.5 hrs', change: '+8%', description: 'Total billable time in last 30 days' },
          { name: 'Avg. Hourly Rate', value: '$293/hr', change: '+5%', description: 'Your effective hourly rate' },
          { name: 'Utilization Rate', value: '83%', change: '+3%', description: 'Billable hours vs. available hours' }
        ];
      }
      
      // For other data, we'll use mock data for now but could be replaced with real API calls
      const caseMetrics = {
        labels: ['Family Law', 'Corporate', 'Real Estate', 'Criminal', 'Employment', 'Other'],
        datasets: [
          {
            label: 'Active Cases',
            data: [3, 2, 1, 1, 0, 0],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)'
          },
          {
            label: 'Completed Cases',
            data: [2, 1, 1, 0, 1, 1],
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgb(16, 185, 129)'
          }
        ]
      };
      
      const timeTracking = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Billable Hours',
            data: [6.5, 7.2, 8.0, 5.5, 6.8, 2.0, 0.0],
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1,
            fill: false
          },
          {
            label: 'Non-Billable Hours',
            data: [1.5, 1.0, 1.2, 2.0, 1.5, 0.5, 0.0],
            borderColor: 'rgb(209, 213, 219)',
            tension: 0.1,
            fill: false
          }
        ]
      };
      
      const clientDistribution = {
        labels: ['Jones Family Trust', 'Acme Corporation', 'Riverside Properties', 'Smith Divorce', 'Johnson Estate', 'Other Clients'],
        datasets: [
          {
            label: 'Billable Hours Last 30 Days',
            data: [18, 12, 10, 8, 6, 4],
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(245, 158, 11, 0.7)',
              'rgba(139, 92, 246, 0.7)',
              'rgba(236, 72, 153, 0.7)',
              'rgba(209, 213, 219, 0.7)'
            ]
          }
        ]
      };
      
      const billingOverview = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
          {
            label: 'Billed ($)',
            data: [12500, 15000, 11200, 18000, 9500],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)'
          },
          {
            label: 'Collected ($)',
            data: [10000, 13500, 10200, 16000, 8500],
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgb(16, 185, 129)'
          },
          {
            label: 'Outstanding ($)',
            data: [2500, 1500, 1000, 2000, 1000],
            backgroundColor: 'rgba(245, 158, 11, 0.5)',
            borderColor: 'rgb(245, 158, 11)'
          }
        ]
      };
      
      const performanceComparison = {
        labels: [
          'Billable Hours', 
          'Case Completion Rate',
          'Client Retention',
          'Revenue Generation',
          'Documentation Quality',
          'Case Win Rate'
        ],
        datasets: [
          {
            label: 'Your Performance',
            data: [85, 78, 92, 80, 88, 83],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff'
          },
          {
            label: 'Firm Average',
            data: [70, 65, 75, 68, 72, 70],
            backgroundColor: 'rgba(107, 114, 128, 0.2)',
            borderColor: 'rgb(107, 114, 128)',
            pointBackgroundColor: 'rgb(107, 114, 128)',
            pointBorderColor: '#fff'
          },
          {
            label: 'Top Performers',
            data: [95, 88, 96, 92, 95, 90],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgb(16, 185, 129)',
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff'
          }
        ]
      };
      
      // Mock upcoming deadlines data
      const upcomingDeadlines = [
        {
          id: 1,
          title: 'Jones v. Smith - File Motion for Summary Judgment',
          dueDate: '2025-05-22',
          priority: 'high',
          caseName: 'Jones Family Trust',
          caseId: 'C-2025-0042'
        },
        {
          id: 2,
          title: 'Acme Corp. - Contract Review Deadline',
          dueDate: '2025-05-23',
          priority: 'medium',
          caseName: 'Acme Corporation',
          caseId: 'C-2025-0038'
        },
        {
          id: 3,
          title: 'Johnson Estate - File Tax Documents',
          dueDate: '2025-05-25',
          priority: 'high',
          caseName: 'Johnson Estate',
          caseId: 'C-2025-0044'
        },
        {
          id: 4,
          title: 'Riverside Properties - Draft Purchase Agreement',
          dueDate: '2025-05-28',
          priority: 'medium',
          caseName: 'Riverside Properties',
          caseId: 'C-2025-0040'
        }
      ];
      
      setAnalyticsData({
        stats,
        caseMetrics,
        timeTracking,
        billingOverview,
        clientDistribution,
        performanceComparison,
        upcomingDeadlines
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
                  {stat.name.includes('Hour') && <ClockIcon className="h-6 w-6 text-white" />}
                  {stat.name.includes('Rate') && <CurrencyDollarIcon className="h-6 w-6 text-white" />}
                  {!stat.name.includes('Case') && !stat.name.includes('Hour') && !stat.name.includes('Rate') && <ChartBarIcon className="h-6 w-6 text-white" />}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </dd>
                    <dd className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stat.description}
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Weekly Time Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">Your billable vs. non-billable hours for the current week</p>
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Client Matters</h3>
          <p className="text-sm text-gray-500 mb-4">Distribution of your billable hours across client matters</p>
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Practice Area Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">Breakdown of your cases by practice area and status</p>
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Billing & Collection Performance</h3>
          <p className="text-sm text-gray-500 mb-4">Your billing and collection trends over the past months</p>
          <div className="h-80">
            <ChartComponent 
              type="bar"
              data={analyticsData.billingOverview}
            />
          </div>
        </div>
      )}
      
      {/* Upcoming Deadlines */}
      {analyticsData.upcomingDeadlines && analyticsData.upcomingDeadlines.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" /> 
            Upcoming Deadlines
          </h3>
          <p className="text-sm text-gray-500 mb-4">Critical dates requiring your attention in the near future</p>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Case
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {analyticsData.upcomingDeadlines.map((deadline) => {
                  // Calculate days remaining
                  const today = new Date();
                  const dueDate = new Date(deadline.dueDate);
                  const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                  
                  let urgencyClass = '';
                  if (daysRemaining <= 3) {
                    urgencyClass = 'text-red-600 dark:text-red-400 font-medium';
                  } else if (daysRemaining <= 7) {
                    urgencyClass = 'text-amber-600 dark:text-amber-400';
                  }
                  
                  return (
                    <tr key={deadline.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          {deadline.priority === 'high' && (
                            <ExclamationCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          {deadline.title}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${urgencyClass}`}>
                        {new Date(deadline.dueDate).toLocaleDateString()} 
                        <span className="ml-2 text-xs">
                          ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {deadline.caseName}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {deadline.caseId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          deadline.priority === 'high' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                            : deadline.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Performance Comparison (anonymized) */}
      {analyticsData.performanceComparison && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Benchmarking</h3>
          <p className="text-sm text-gray-500 mb-4">Comparing your key performance metrics against firm averages and top performers</p>
          <div className="h-80">
            <ChartComponent 
              type="radar"
              data={analyticsData.performanceComparison}
            />
          </div>
          <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Performance Insights</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
              <li>Your client retention rate is excellent, ranking in the top 15% of all attorneys</li>
              <li>Your case completion rate is slightly above average but has room for improvement</li>
              <li>Your documentation quality scores are strong, showing attention to detail</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
