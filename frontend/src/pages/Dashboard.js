import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  DocumentTextIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  ArrowRightIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Mock data
  const stats = [
    { name: 'Active Cases', value: '12', change: '+3', trend: 'up', icon: BriefcaseIcon, color: 'bg-primary-500' },
    { name: 'New Clients', value: '4', change: '+2', trend: 'up', icon: UserGroupIcon, color: 'bg-emerald-500' },
    { name: 'Billable Hours', value: '84h', change: '+12%', trend: 'up', icon: ClockIcon, color: 'bg-violet-500' },
    { name: 'Monthly Revenue', value: '$14.8k', change: '+8%', trend: 'up', icon: CurrencyDollarIcon, color: 'bg-amber-500' },
  ];

  const upcomingDeadlines = [
    { id: 1, title: 'Reply to Summary Judgment', dueDate: 'Today', case: 'Williams v. Northern Hospital', priority: 'Urgent' },
    { id: 2, title: 'File Motion to Dismiss', dueDate: 'Tomorrow', case: 'Johnson Divorce', priority: 'High' },
    { id: 3, title: 'Contract Review', dueDate: 'Nov 24', case: 'Tech Corp Acquisition', priority: 'Medium' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Case Hearing', time: '2:00 PM', date: 'Today', location: 'Courtroom 4B', client: 'Johnson' },
    { id: 2, title: 'Client Meeting', time: '10:00 AM', date: 'Tomorrow', location: 'Conference Room A', client: 'Williams' },
    { id: 3, title: 'Deposition', time: '1:30 PM', date: 'Nov 24', location: 'Smith & Partners LLP', client: 'Tech Corp' },
  ];

  const activeCases = [
    { id: 101, title: 'Williams v. Northern Hospital', type: 'Medical Malpractice', status: 'Active', progress: 65, lastAction: 'Motion Filed', lastActionDate: '2 days ago' },
    { id: 102, title: 'Johnson Divorce Settlement', type: 'Family Law', status: 'Active', progress: 40, lastAction: 'Document Review', lastActionDate: 'Yesterday' },
    { id: 103, title: 'Tech Corp Acquisition', type: 'Corporate', status: 'Active', progress: 85, lastAction: 'Contract Negotiation', lastActionDate: '3 hours ago' },
  ];

  const recentDocuments = [
    { id: 1, name: 'Medical Records.pdf', case: 'Williams v. Northern Hospital', addedBy: 'You', addedOn: '3 hours ago', size: '4.2 MB' },
    { id: 2, name: 'Settlement Agreement.docx', case: 'Johnson Divorce', addedBy: 'Amanda P.', addedOn: 'Yesterday', size: '1.8 MB' },
    { id: 3, name: 'Acquisition Term Sheet.pdf', case: 'Tech Corp Acquisition', addedBy: 'You', addedOn: '2 days ago', size: '3.5 MB' },
  ];

  const recentActivity = [
    { id: 1, action: 'Document uploaded', detail: 'Medical Records.pdf', time: '3 hours ago', case: 'Williams v. Northern Hospital' },
    { id: 2, action: 'Comment added', detail: 'Call client about settlement options', time: 'Yesterday', case: 'Johnson Divorce' },
    { id: 3, action: 'Meeting scheduled', detail: 'Final contract review with client', time: '2 days ago', case: 'Tech Corp Acquisition' },
  ];

  // Get the current date and time
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Format hours and minutes
  const hours = today.getHours();
  const minutes = today.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const formattedTime = `${displayHours}:${minutes} ${ampm}`;

  // Get appropriate greeting
  const getGreeting = () => {
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{formattedDate} • {formattedTime}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/cases/new" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Case
            </Link>
          </div>
        </div>
        
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/10 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-blue-600">
                  <span className="text-lg font-medium leading-none text-white">
                    {user?.first_name?.[0] || user?.email?.[0] || 'A'}
                  </span>
                </span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getGreeting()}, {user?.first_name || user?.email?.split('@')[0] || 'Counselor'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Here's an overview of your practice today.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
            <div className="px-6 py-5 text-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks requiring attention</span>
              <div className="mt-1 flex items-baseline justify-center">
                <span className="text-2xl font-semibold text-primary-600 dark:text-primary-400">6</span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">open items</span>
              </div>
            </div>
            <div className="px-6 py-5 text-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming deadlines</span>
              <div className="mt-1 flex items-baseline justify-center">
                <span className="text-2xl font-semibold text-primary-600 dark:text-primary-400">3</span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">within 7 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
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
        {/* Deadlines */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Deadlines</h3>
              <FireIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingDeadlines.map((deadline) => (
              <li key={deadline.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{deadline.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{deadline.case}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${deadline.priority === 'Urgent' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : deadline.priority === 'High' 
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                      {deadline.priority}
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {deadline.dueDate}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <Link to="/calendar" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center">
              View all deadlines
              <ArrowRightIcon className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Calendar Events */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Events</h3>
              <CalendarIcon className="h-5 w-5 text-primary-500" aria-hidden="true" />
            </div>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{event.location}</p>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm text-gray-900 dark:text-white">{event.time}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{event.date}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <Link to="/calendar" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center">
              View full calendar
              <ArrowRightIcon className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Cases */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Cases</h3>
            <BriefcaseIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
        <div className="flow-root">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {activeCases.map((cas) => (
              <li key={cas.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{cas.title}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{cas.type}</span>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Last action: {cas.lastAction} {cas.lastActionDate}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
                        style={{ width: `${cas.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">{cas.progress}%</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
          <Link to="/cases" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center">
            View all cases
            <ArrowRightIcon className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Two column layout for documents and activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Documents */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Documents</h3>
              <DocumentTextIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentDocuments.map((doc) => (
              <li key={doc.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{doc.case}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Added by {doc.addedBy}</span>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                      <span>{doc.addedOn}</span>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <Link to="/documents" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center">
              View all documents
              <ArrowRightIcon className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
              <BellIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.detail}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{activity.time}</span>
                    <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                    <span>{activity.case}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <Link to="/activity" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center">
              View all activity
              <ArrowRightIcon className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Preview */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance Analytics</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="py-12">
            <p className="text-gray-500 dark:text-gray-400">Analytics data visualization will appear here</p>
            <div className="mt-4">
              <Link 
                to="/analytics" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                View detailed analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
