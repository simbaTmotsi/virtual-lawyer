import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

const EventModal = ({ isOpen, onClose, event, onSave, onDelete, cases, staff }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    all_day: false,
    event_type: 'meeting',
    location: '',
    case: '',
    attendees: []
  });
  
  const [errors, setErrors] = useState({});
  
  // Initialize form with event data if editing
  useEffect(() => {
    if (event) {
      setFormData({
        id: event.id || null,
        title: event.title || '',
        description: event.description || '',
        start_time: formatDateTime(event.start_time || new Date()),
        end_time: formatDateTime(event.end_time || addHours(new Date(), 1)),
        all_day: event.all_day || false,
        event_type: event.event_type || 'meeting',
        location: event.location || '',
        case: event.case || '',
        attendees: event.attendees || []
      });
    }
  }, [event]);
  
  // Helper to add hours to a date
  const addHours = (date, hours) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  };
  
  // Format date for datetime-local input
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    
    // Format as YYYY-MM-DDTHH:MM
    return date.toISOString().slice(0, 16);
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle multi-select for attendees
  const handleAttendeeSelection = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setFormData({
      ...formData,
      attendees: selectedValues
    });
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }
    
    if (!formData.all_day && !formData.end_time) {
      newErrors.end_time = 'End time is required for non-all-day events';
    }
    
    if (formData.start_time && formData.end_time && new Date(formData.start_time) > new Date(formData.end_time)) {
      newErrors.end_time = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSave(formData);
  };
  
  // Delete event
  const handleDelete = () => {
    onDelete(formData.id);
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 dark:text-white">
                    {formData.id ? 'Edit Event' : 'Create New Event'}
                  </Dialog.Title>
                  <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="px-6 py-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md ${
                          errors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                      )}
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    {/* Event Type */}
                    <div>
                      <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Event Type
                      </label>
                      <select
                        id="event_type"
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      >
                        <option value="meeting">Meeting</option>
                        <option value="deadline">Deadline</option>
                        <option value="hearing">Court Hearing</option>
                        <option value="task">Task</option>
                        <option value="reminder">Reminder</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    {/* All Day Toggle */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="all_day"
                          name="all_day"
                          type="checkbox"
                          checked={formData.all_day}
                          onChange={handleChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="all_day" className="font-medium text-gray-700 dark:text-gray-300">
                          All Day Event
                        </label>
                      </div>
                    </div>
                    
                    {/* Date/Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Start {formData.all_day ? 'Date' : 'Time'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type={formData.all_day ? "date" : "datetime-local"}
                          id="start_time"
                          name="start_time"
                          value={formData.all_day ? formData.start_time.split('T')[0] : formData.start_time}
                          onChange={handleChange}
                          className={`mt-1 block w-full rounded-md ${
                            errors.start_time ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                          } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                        />
                        {errors.start_time && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.start_time}</p>
                        )}
                      </div>
                      
                      {!formData.all_day && (
                        <div>
                          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            End Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            id="end_time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md ${
                              errors.end_time ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                            } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                          />
                          {errors.end_time && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.end_time}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Location */}
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="Office, Court, Zoom Meeting, etc."
                      />
                    </div>
                    
                    {/* Associated Case */}
                    <div>
                      <label htmlFor="case" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Associated Case
                      </label>
                      <select
                        id="case"
                        name="case"
                        value={formData.case}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">None</option>
                        {cases.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Attendees */}
                    <div>
                      <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Attendees
                      </label>
                      <select
                        id="attendees"
                        name="attendees"
                        multiple
                        value={formData.attendees}
                        onChange={handleAttendeeSelection}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white h-32"
                      >
                        {staff.map(person => (
                          <option key={person.id} value={person.id}>
                            {person.first_name} {person.last_name} ({person.role})
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Hold Ctrl (or Cmd on Mac) to select multiple attendees.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    {formData.id && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete Event
                      </button>
                    )}
                    
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {formData.id ? 'Update Event' : 'Create Event'}
                      </button>
                    </div>
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

export default EventModal;
