import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BriefcaseIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon
} from '@heroicons/react/24/solid';
import apiRequest from '../utils/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    upcomingDeadlines: [],
    upcomingEvents: [],
    activeCases: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [stats, deadlines, events, cases] = await Promise.all([
          apiRequest('/api/dashboard/stats/'),
          apiRequest('/api/dashboard/deadlines/'),
          apiRequest('/api/calendar/events/upcoming/'), // Use the new endpoint
          apiRequest('/api/dashboard/active-cases/')
        ]);
        
        setDashboardData({
          stats: stats || [],
          upcomingDeadlines: deadlines || [],
          upcomingEvents: events || [], // This now comes from the calendar API
          activeCases: cases || []
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  // Map the stats to their icons and colors
  const statsWithIcons = dashboardData.stats.map(stat => {
    const icons = {
      'Active Cases': BriefcaseIcon,
      'Billable Hours': ClockIcon,
      'Monthly Revenue': CurrencyDollarIcon,
      'New Clients': UsersIcon
    };
    
    const colors = {
      'Active Cases': 'bg-blue-500',
      'Billable Hours': 'bg-violet-500',
      'Monthly Revenue': 'bg-amber-500',
      'New Clients': 'bg-green-500'
    };
    
    return {
      ...stat,
      icon: icons[stat.name] || BriefcaseIcon,
      color: colors[stat.name] || 'bg-gray-500'
    };
  });

  return (
    <div>
      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/10 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center">
              <ClipboardDocumentCheckIcon className="h-8 w-8 mr-4" />
              <h3 className="text-xl font-semibold">Tasks & Deadlines</h3>
            </div>
            <div className="mt-1 flex items-baseline justify-center">
              <span className="text-2xl font-semibold text-white">
                {dashboardData.upcomingDeadlines.length}
              </span>
              <span className="ml-2 text-sm text-blue-100">upcoming deadlines</span>
            </div>
          </div>
          <div className="p-5">
            <Link to="/tasks" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium flex items-center justify-center">
              View All Tasks
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/10 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 mr-4" />
              <h3 className="text-xl font-semibold">Active Cases</h3>
            </div>
            <div className="mt-1 flex items-baseline justify-center">
              <span className="text-2xl font-semibold text-white">
                {dashboardData.activeCases.length}
              </span>
              <span className="ml-2 text-sm text-purple-100">cases in progress</span>
            </div>
          </div>
          <div className="p-5">
            <Link to="/cases" className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium flex items-center justify-center">
              View All Cases
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/10 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 mr-4" />
              <h3 className="text-xl font-semibold">Upcoming Events</h3>
            </div>
            <div className="mt-1 flex items-baseline justify-center">
              <span className="text-2xl font-semibold text-white">
                {dashboardData.upcomingEvents.length}
              </span>
              <span className="ml-2 text-sm text-amber-100">within 7 days</span>
            </div>
          </div>
          <div className="p-5">
            <Link to="/calendar" className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium flex items-center justify-center">
              View Calendar
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsWithIcons.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow dark:shadow-gray-700/10 transition-all duration-200 hover:shadow-md">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md ${stat.color} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-2">
              <div className="flex items-center">
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
                  {stat.change} from last month
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout for deadlines and events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Deadlines</h3>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.upcomingDeadlines.length === 0 ? (
                <li className="py-4 text-center text-gray-500 dark:text-gray-400">No upcoming deadlines</li>
              ) : (
                dashboardData.upcomingDeadlines.map((deadline) => (
                  <li key={deadline.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{deadline.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{deadline.case}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          deadline.priority === 'Urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          deadline.priority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {deadline.priority}
                        </span>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{deadline.dueDate}</span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Events</h3>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.upcomingEvents.length === 0 ? (
                <li className="py-4 text-center text-gray-500 dark:text-gray-400">No upcoming events</li>
              ) : (
                dashboardData.upcomingEvents.map((event) => (
                  <li key={event.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {event.case_details && <span>Case: {event.case_details.title}</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(event.start_time).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {event.all_day ? 'All day' : new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{event.location}</p>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Active Cases */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Cases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Case</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Progress</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.activeCases.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No active cases found</td>
                </tr>
              ) : (
                dashboardData.activeCases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/cases/${caseItem.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                        {caseItem.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{caseItem.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
                          style={{ width: `${caseItem.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{caseItem.progress}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {caseItem.lastAction} <span className="text-xs">{caseItem.lastActionDate}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
