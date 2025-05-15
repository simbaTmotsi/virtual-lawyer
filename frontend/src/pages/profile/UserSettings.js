import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import apiRequest from '../../utils/api';
import { toast } from '../../utils/notification';
import { CheckCircleIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const UserSettings = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    case_updates: true,
    billing_updates: true,
    system_announcements: true
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    activity_tracking: true,
    share_usage_data: false
  });
  
  useEffect(() => {
    // Fetch notification and privacy settings
    const fetchSettings = async () => {
      try {
        const response = await apiRequest.get('/api/accounts/settings/');
        if (response.data) {
          setNotificationSettings({
            email_notifications: response.data.email_notifications ?? true,
            push_notifications: response.data.push_notifications ?? true,
            case_updates: response.data.case_updates ?? true,
            billing_updates: response.data.billing_updates ?? true,
            system_announcements: response.data.system_announcements ?? true
          });
          
          setPrivacySettings({
            activity_tracking: response.data.activity_tracking ?? true,
            share_usage_data: response.data.share_usage_data ?? false
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings({
      ...privacySettings,
      [name]: checked
    });
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    setLoading(true);
    setSuccess(false);
    
    try {
      await apiRequest.post('/api/accounts/change-password/', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      
      setSuccess(true);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const saveSettings = async () => {
    setLoading(true);
    
    try {
      await apiRequest.patch('/api/accounts/settings/', {
        ...notificationSettings,
        ...privacySettings
      });
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Password Change */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-primary-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Security Settings</h3>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Manage your account password and security preferences.</p>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <div className="px-4 py-5 sm:p-6">
            {success && (
              <div className="mb-4 p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Password changed successfully!</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="current_password"
                    id="current_password"
                    value={passwordForm.current_password}
                    onChange={handlePasswordChange}
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="new_password"
                    id="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="confirm_password"
                    id="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification & Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Notification Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Manage how you receive notifications and updates.</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email_notifications"
                    name="email_notifications"
                    type="checkbox"
                    checked={notificationSettings.email_notifications}
                    onChange={handleNotificationChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email_notifications" className="font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                  <p className="text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="push_notifications"
                    name="push_notifications"
                    type="checkbox"
                    checked={notificationSettings.push_notifications}
                    onChange={handleNotificationChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="push_notifications" className="font-medium text-gray-700 dark:text-gray-300">Push Notifications</label>
                  <p className="text-gray-500 dark:text-gray-400">Receive push notifications in your browser</p>
                </div>
              </div>

              <div className="ml-7 space-y-4 mt-4 border-l-2 border-gray-100 dark:border-gray-700 pl-5">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="case_updates"
                      name="case_updates"
                      type="checkbox"
                      checked={notificationSettings.case_updates}
                      onChange={handleNotificationChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="case_updates" className="font-medium text-gray-700 dark:text-gray-300">Case Updates</label>
                    <p className="text-gray-500 dark:text-gray-400">Notifications about case changes and updates</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="billing_updates"
                      name="billing_updates"
                      type="checkbox"
                      checked={notificationSettings.billing_updates}
                      onChange={handleNotificationChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="billing_updates" className="font-medium text-gray-700 dark:text-gray-300">Billing Updates</label>
                    <p className="text-gray-500 dark:text-gray-400">Notifications about invoices and payments</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="system_announcements"
                      name="system_announcements"
                      type="checkbox"
                      checked={notificationSettings.system_announcements}
                      onChange={handleNotificationChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="system_announcements" className="font-medium text-gray-700 dark:text-gray-300">System Announcements</label>
                    <p className="text-gray-500 dark:text-gray-400">Important announcements and updates about the system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy settings */}
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Privacy Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Manage your privacy preferences.</p>
        </div>
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="activity_tracking"
                  name="activity_tracking"
                  type="checkbox"
                  checked={privacySettings.activity_tracking}
                  onChange={handlePrivacyChange}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="activity_tracking" className="font-medium text-gray-700 dark:text-gray-300">Activity Tracking</label>
                <p className="text-gray-500 dark:text-gray-400">Allow tracking of your activity within the system for better analytics and reporting</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="share_usage_data"
                  name="share_usage_data"
                  type="checkbox"
                  checked={privacySettings.share_usage_data}
                  onChange={handlePrivacyChange}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="share_usage_data" className="font-medium text-gray-700 dark:text-gray-300">Share Usage Data</label>
                <p className="text-gray-500 dark:text-gray-400">Help improve the system by sharing anonymous usage data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Setting */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Appearance</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Customize your experience.</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  ${darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
                `}
                role="switch"
                aria-checked={darkMode}
              >
                <span
                  aria-hidden="true"
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-800 shadow ring-0 transition duration-200 ease-in-out
                    ${darkMode ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
          <button
            type="button"
            onClick={saveSettings}
            disabled={loading}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
