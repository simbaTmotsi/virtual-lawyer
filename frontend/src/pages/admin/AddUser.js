import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import { toast } from '../../utils/notification';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'client',
    password: '',
    confirm_password: '',
    is_active: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData({
      ...userData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    if (!userData.email || !userData.first_name || !userData.last_name) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    if (!userData.password) {
      toast.error('Password is required');
      return false;
    }
    
    if (userData.password !== userData.confirm_password) {
      toast.error('Passwords do not match');
      return false;
    }
    
    if (userData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSuccess(false);

    try {
      // Remove confirm_password before sending to API
      const { confirm_password, ...dataToSend } = userData;
      
      await apiRequest('/api/admin/users/', 'POST', dataToSend);
      setSuccess(true);
      toast.success('User created successfully');
      
      // Reset form
      setUserData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'client',
        password: '',
        confirm_password: '',
        is_active: true
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.email) {
        toast.error(`Email error: ${error.response.data.email[0]}`);
      } else {
        toast.error(error.response?.data?.detail || 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => navigate('/admin/users')} 
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mb-2"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Users
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Add New User</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Create a new user account
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-4 py-5 sm:p-6">
          {success && (
            <div className="mb-4 p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    User created successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  required
                  value={userData.first_name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  required
                  value={userData.last_name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={userData.email}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                User Role <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  required
                  value={userData.role}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="client">Client</option>
                  <option value="staff">Staff</option>
                  <option value="lawyer">Lawyer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Sets the user's permissions in the system
              </p>
            </div>

            <div className="sm:col-span-3">
              <div className="mt-4 flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={userData.is_active}
                    onChange={handleChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="is_active" className="font-medium text-gray-700 dark:text-gray-300">
                    Active Account
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Uncheck to create an inactive account
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={userData.password}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                At least 8 characters
              </p>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="confirm_password"
                  id="confirm_password"
                  required
                  value={userData.confirm_password}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
