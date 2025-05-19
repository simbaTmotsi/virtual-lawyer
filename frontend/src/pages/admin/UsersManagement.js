import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import { toast } from '../../utils/notification';

const UsersManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingForm, setBillingForm] = useState({
    billing_enabled: false,
    billing_rate: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/admin/users/');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/set_active_status/`, 'POST', {
        is_active: !isActive
      });
      fetchUsers(); // Refresh the list
      toast.success(`User ${isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling user active status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await apiRequest(`/api/admin/users/${userId}/`, 'DELETE');
      fetchUsers(); // Refresh the list
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const openBillingModal = (user) => {
    setSelectedUser(user);
    setBillingForm({
      billing_enabled: user.billing_enabled || false,
      billing_rate: user.billing_rate || ''
    });
    setShowBillingModal(true);
  };

  const handleBillingFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBillingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveBillingSettings = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/api/admin/users/${selectedUser.id}/update_billing_settings/`, 'POST', billingForm);
      setShowBillingModal(false);
      fetchUsers(); // Refresh the list
      toast.success('Billing settings updated successfully');
    } catch (error) {
      console.error('Error updating billing settings:', error);
      toast.error('Failed to update billing settings');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Users Management</h2>
        <button 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
          onClick={() => navigate('/admin/users/add')}
        >
          <UserPlusIcon className="h-4 w-4 mr-2" /> Add New User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Login</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Billing</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                  Loading users...
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {user.is_staff ? 'Admin' : 'User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col">
                      <span className={`inline-flex text-xs leading-5 font-semibold ${
                        user.billing_enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {user.billing_enabled ? 'Billing Enabled' : 'Billing Disabled'}
                      </span>
                      {user.billing_enabled && user.billing_rate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Rate: ${parseFloat(user.billing_rate).toFixed(2)}/hr
                        </span>
                      )}
                    </div>
                    <button 
                      className="mt-1 text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-200 text-xs font-medium"
                      onClick={() => openBillingModal(user)}
                    >
                      Edit Billing
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button 
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-200"
                      onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      className={`${user.is_active ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'} hover:text-opacity-80`}
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      title={user.is_active ? 'Deactivate user' : 'Activate user'}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Billing Settings Modal */}
      {showBillingModal && selectedUser && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowBillingModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 sm:mx-0 sm:h-10 sm:w-10">
                    <CurrencyDollarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Billing Settings for {selectedUser.first_name} {selectedUser.last_name}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={saveBillingSettings}>
                        <div className="mb-4">
                          <div className="flex items-center">
                            <input
                              id="billing_enabled"
                              name="billing_enabled"
                              type="checkbox"
                              checked={billingForm.billing_enabled}
                              onChange={handleBillingFormChange}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="billing_enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                              Enable Billing
                            </label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            When enabled, this user can log billable time and be included in invoices.
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="billing_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Hourly Rate ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            id="billing_rate"
                            name="billing_rate"
                            value={billingForm.billing_rate}
                            onChange={handleBillingFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="0.00"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Default hourly rate for this user's time entries.
                          </p>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={saveBillingSettings}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowBillingModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
