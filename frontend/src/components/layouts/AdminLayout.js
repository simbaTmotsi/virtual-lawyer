import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Cog6ToothIcon, 
  UsersIcon, 
  AcademicCapIcon, 
  ChartBarIcon, 
  ArrowLeftOnRectangleIcon, 
  HomeIcon, 
  CurrencyDollarIcon,
  SunIcon,
  MoonIcon,
  ChatBubbleLeftEllipsisIcon, // Icon for Gemini Query
  CircleStackIcon, // Icon for Legal DB Search
  DocumentMagnifyingGlassIcon, // Icon for Comprehensive Research
  ScaleIcon, // Icon for Case Recommendations
  ChartPieIcon // New Icon for API Usage Metrics
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
import { useDarkMode } from '../../contexts/DarkModeContext';
import Tooltip from '../ui/Tooltip';

const adminNav = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'User Billing', href: '/admin/users?tab=billing', icon: CurrencyDollarIcon },
  { name: 'System Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  { name: 'LLM Integration', href: '/admin/llm-integration', icon: AcademicCapIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Gemini Query', href: '/admin/research/gemini-query', icon: ChatBubbleLeftEllipsisIcon },
  { name: 'Legal DB Search', href: '/admin/research/legal-db-search', icon: CircleStackIcon },
  { name: 'Comprehensive Research', href: '/admin/research/comprehensive-research', icon: DocumentMagnifyingGlassIcon },
  { name: 'Case Recommendations', href: '/admin/research/case-recommendations', icon: ScaleIcon },
  { name: 'API Usage Metrics', href: '/admin/analytics/api-usage', icon: ChartPieIcon }, // New Nav Link for API Usage Metrics
];

const AdminLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 px-4">
          <Cog6ToothIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Admin Panel</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                ${location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href))
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 transition-colors duration-150
                  ${location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href))
                    ? 'text-primary-500 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/"
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <HomeIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
            Back to Main App
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {adminNav.find(item => location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href)))?.name || 'Admin'}
          </h1>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <Tooltip 
              content={darkMode ? "Switch to light mode (Shift+D)" : "Switch to dark mode (Shift+D)"} 
              position="bottom"
            >
              <button
                type="button"
                className="rounded-full bg-white dark:bg-gray-700 p-1 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={toggleDarkMode}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <SunIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <MoonIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </Tooltip>
            
            {/* Sign Out Button */}
            <Tooltip content="Sign out" position="bottom">
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white dark:bg-gray-700 p-1 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Sign out"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </Tooltip>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {/* Admin page content goes here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
