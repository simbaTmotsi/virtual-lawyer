import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  BriefcaseIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { ScaleIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Clients', href: '/clients', icon: UserGroupIcon },
  { name: 'Cases', href: '/cases', icon: BriefcaseIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Diary', href: '/diary', icon: BookOpenIcon },
  { name: 'Billing', href: '/billing', icon: CurrencyDollarIcon },
  { name: 'Research', href: '/research', icon: AcademicCapIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, id: 'main-analytics' },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: Cog6ToothIcon },
  { name: 'User Management', href: '/admin/users', icon: UserGroupIcon },
  { name: 'System Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  { name: 'LLM Integration', href: '/admin/llm-integration', icon: AcademicCapIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, id: 'admin-analytics' },
];

const Sidebar = ({ isMobile, setSidebarOpen, showAdminLink = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);

  const isAdminUser = user?.role === 'admin';
  const navItems = isAdminUser 
    ? [...navigation, { divider: true }, ...adminNavigation] 
    : navigation;

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-6 mb-6">
        <ScaleIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        <span className="ml-2 text-2xl font-semibold text-gray-900 dark:text-white">EasyLaw</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 mt-5 flex flex-col px-3">
        <nav className="flex-1 space-y-1">
          {navItems.map((item, idx) => 
            item.divider ? (
              <div key={`divider-${idx}`} className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            ) : (
              <Link
                key={item.id || `${item.name}-${item.href}`} // Use unique id or generate one
                to={item.href}
                onClick={handleNavClick}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                  ${location.pathname === item.href 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
              >
                <item.icon 
                  className={`
                    mr-3 h-5 w-5 transition-colors duration-150
                    ${location.pathname === item.href 
                      ? 'text-primary-500 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}
                  `} 
                  aria-hidden="true" 
                />
                {item.name}
              </Link>
            )
          )}

          {/* Admin Link - Only visible to admin users */}
          {showAdminLink && (
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/admin"
                className={`${
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <Cog6ToothIcon
                  className={`${
                    location.pathname.startsWith('/admin')
                      ? 'text-amber-500 dark:text-amber-400'
                      : 'text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                Admin Dashboard
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Help section */}
      <div className="mt-4 mb-6 px-3">
        <div 
          onClick={() => setHelpOpen(!helpOpen)}
          className="cursor-pointer group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <QuestionMarkCircleIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          Help & Resources
        </div>
        
        {helpOpen && (
          <div className="mt-1 ml-8 space-y-1 text-sm">
            <Link to="/documentation" onClick={handleNavClick} className="block py-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Documentation
            </Link>
            <Link to="/support" onClick={handleNavClick} className="block py-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Contact Support
            </Link>
            <Link to="/terms" onClick={handleNavClick} className="block py-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Terms of Service
            </Link>
            <Link to="/privacy" onClick={handleNavClick} className="block py-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Privacy Policy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
