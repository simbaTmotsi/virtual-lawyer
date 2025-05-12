import React, { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  BellIcon, 
  SunIcon, 
  MoonIcon, 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Tooltip from '../ui/Tooltip';
import KeyboardShortcutsModal from '../ui/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '../../utils/keyboardShortcuts';

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [notificationsCount] = useState(3); // Mock notification count
  
  // Register keyboard shortcuts
  const { shortcutsModalOpen, setShortcutsModalOpen } = useKeyboardShortcuts(navigate, {
    TOGGLE_DARK_MODE: toggleDarkMode
  });

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20">
      {/* Mobile menu button */}
      <Tooltip content="Toggle sidebar" position="bottom">
        <button
          type="button"
          className="border-r border-gray-200 dark:border-gray-700 px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      </Tooltip>
      
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-lg lg:max-w-xs">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full rounded-md border-0 bg-gray-50 dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                placeholder="Search... (Press '/' to focus)"
                type="search"
              />
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          {/* Keyboard shortcuts */}
          <Tooltip content="Keyboard shortcuts (Press ?)" position="bottom">
            <button
              type="button"
              className="rounded-full bg-white dark:bg-gray-700 p-1 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setShortcutsModalOpen(true)}
              aria-label="Keyboard shortcuts"
            >
              <CommandLineIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </Tooltip>
          
          {/* Help */}
          <Tooltip content="Get help" position="bottom">
            <button
              type="button"
              className="rounded-full bg-white dark:bg-gray-700 p-1 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Help"
            >
              <QuestionMarkCircleIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </Tooltip>
          
          {/* Dark mode toggle */}
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
          
          {/* Notifications */}
          <Tooltip content="View notifications" position="bottom">
            <button
              type="button"
              className="rounded-full bg-white dark:bg-gray-700 p-1 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 relative"
              aria-label="View notifications"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              {notificationsCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
                  {notificationsCount}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Profile dropdown */}
          <Menu as="div" className="relative ml-3">
            <Tooltip content="Your account" position="bottom">
              <Menu.Button className="flex max-w-xs items-center rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                  <UserIcon className="h-5 w-5" />
                </div>
              </Menu.Button>
            </Tooltip>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                  <p>Signed in as</p>
                  <p className="font-semibold truncate">{user?.email}</p>
                </div>
                
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full`}
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Your Profile
                    </Link>
                  )}
                </Menu.Item>
                
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/settings"
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full`}
                    >
                      <CogIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Settings
                    </Link>
                  )}
                </Menu.Item>
                
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
      
      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal 
        isOpen={shortcutsModalOpen} 
        onClose={() => setShortcutsModalOpen(false)} 
      />
    </header>
  );
};

export default Header;
