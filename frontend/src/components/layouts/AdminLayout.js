import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Cog6ToothIcon, UsersIcon, AcademicCapIcon, ChartBarIcon, ArrowLeftOnRectangleIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed

const adminNav = [
  { name: 'Admin Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'System Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  { name: 'LLM Integration', href: '/admin/llm-integration', icon: AcademicCapIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
];

const AdminLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();

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
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mb-2"
          >
            <HomeIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
            Back to Main App
          </Link>
          <button
            onClick={logout}
            className="group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center px-6">
          {/* Can add breadcrumbs or page title here */}
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {adminNav.find(item => location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href)))?.name || 'Admin'}
          </h1>
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
