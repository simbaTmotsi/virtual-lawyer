import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import { toast } from '../../utils/notification';

const TimeEntryModal = ({ isOpen, onClose, onSuccess, initialData = {} }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    case: initialData.case || '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    hours: initialData.hours || '',
    description: initialData.description || '',
    is_billable: initialData.is_billable !== undefined ? initialData.is_billable : true,
    rate: initialData.rate || ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const casesData = await apiRequest('/api/cases/');
      setCases(casesData || []);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
      toast.error('Failed to load cases. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.case) newErrors.case = 'Case is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.hours || formData.hours <= 0) newErrors.hours = 'Valid hours are required';
    if (!formData.description) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await apiRequest('/api/billing/time-entries/', 'POST', formData);
      toast.success('Time entry created successfully');
      onSuccess();
    } catch (err) {
      console.error('Error saving time entry:', err);
      toast.error('Failed to save time entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start mb-4">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 sm:mx-0 sm:h-10 sm:w-10">
                    <ClockIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Log Time Entry
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Record your time spent on a case or task.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="case" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Case <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="case"
                        name="case"
                        value={formData.case}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md ${
                          errors.case ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                      >
                        <option value="">Select a case</option>
                        {cases.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                      {errors.case && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.case}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md ${
                          errors.date ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                      />
                      {errors.date && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hours <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        id="hours"
                        name="hours"
                        value={formData.hours}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`mt-1 block w-full rounded-md ${
                          errors.hours ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                      />
                      {errors.hours && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.hours}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        id="rate"
                        name="rate"
                        value={formData.rate}
                        onChange={handleChange}
                        placeholder="Default rate will be used if blank"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the work performed..."
                        className={`mt-1 block w-full rounded-md ${
                          errors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <input
                          id="is_billable"
                          name="is_billable"
                          type="checkbox"
                          checked={formData.is_billable}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_billable" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                          This time is billable
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Time Entry'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TimeEntryModal;
