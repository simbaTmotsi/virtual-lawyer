import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import apiRequest from '../utils/api';
import EventModal from '../components/calendar/EventModal';
import Tooltip from '../components/Tooltip';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    eventType: '',
    caseId: '',
    assignedTo: ''
  });
  const [cases, setCases] = useState([]);
  const [staff, setStaff] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  
  // Fetch events, cases, and staff data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let eventsData = [], casesData = [], staffData = [];
        
        try {
          eventsData = await apiRequest('/api/calendar/events/');
        } catch (err) {
          console.warn('Failed to fetch events:', err);
          // Use empty array as fallback
        }
        
        try {
          casesData = await apiRequest('/api/cases/');
        } catch (err) {
          console.warn('Failed to fetch cases:', err);
          // Use empty array as fallback
        }
        
        try {
          staffData = await apiRequest('/api/users/?role=attorney');
        } catch (err) {
          console.warn('Failed to fetch staff:', err);
          // Use empty array as fallback
        }
        
        setEvents(eventsData || []);
        setCases(casesData || []);
        setStaff(staffData || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch calendar data:', err);
        setError('Failed to load calendar data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Helper to assign colors based on event type
  const getEventColor = (eventType) => {
    switch(eventType) {
      case 'meeting': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200';
      case 'deadline': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'hearing': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
      case 'task': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'reminder': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  // Navigation functions
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Save an event (create or update)
  const handleSaveEvent = async (eventData) => {
    try {
      setLoading(true);
      let savedEvent;
      
      if (eventData.id) {
        // Update existing event
        savedEvent = await apiRequest(`/api/calendar/events/${eventData.id}/`, 'PUT', eventData);
        
        // Update events list
        setEvents(events.map(e => e.id === savedEvent.id ? savedEvent : e));
      } else {
        // Create new event
        savedEvent = await apiRequest('/api/calendar/events/', 'POST', eventData);
        
        // Add to events list
        setEvents([...events, savedEvent]);
      }
      
      setShowModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to save event:', err);
      alert('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete an event
  const handleDeleteEvent = async (eventId) => {
    if (!eventId) return;
    
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      setLoading(true);
      await apiRequest(`/api/calendar/events/${eventId}/`, 'DELETE');
      setEvents(events.filter(e => e.id !== eventId));
      setShowModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters to events
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.eventType) params.append('event_type', filters.eventType);
      if (filters.caseId) params.append('case', filters.caseId);
      if (filters.assignedTo) params.append('attendee', filters.assignedTo);
      
      const eventsData = await apiRequest(`/api/calendar/events/?${params.toString()}`);
      setEvents(eventsData || []);
    } catch (err) {
      console.error('Failed to apply filters:', err);
      setError('Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
      setShowFilters(false);
    }
  };
  
  // Clear all filters
  const handleResetFilters = async () => {
    setFilters({
      eventType: '',
      caseId: '',
      assignedTo: ''
    });
    
    try {
      setLoading(true);
      const eventsData = await apiRequest('/api/calendar/events/');
      setEvents(eventsData || []);
    } catch (err) {
      console.error('Failed to reset filters:', err);
      setError('Failed to reset filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate days for the current month view
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Total days to display including padding from previous/next months
    const totalDays = [];
    
    // Add days from previous month for padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      totalDays.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      totalDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to complete the grid (always show 6 weeks)
    const remainingDays = 42 - totalDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      totalDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return totalDays;
  };
  
  // Get events for a specific day
  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getDate() === date.getDate() && 
             eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const renderEventWithBadge = (event) => {
    return (
      <Tooltip 
        key={event.id} 
        content={`${event.title} - ${new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
        position="top"
      >
        <div 
          className={`px-2 py-1 text-xs rounded-md truncate cursor-pointer ${getEventColor(event.event_type)}`}
          onClick={() => handleEventClick(event)}
        >
          {event.title}
        </div>
      </Tooltip>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-lg">{error}</p>
        <p className="text-gray-600 dark:text-gray-400">Could not load calendar data. Please try again later.</p>
      </div>
    );
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const calendarDays = getDaysInMonth();

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Calendar</h2>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Filters
          </button>
          
          <button
            onClick={() => {
              setSelectedEvent(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Event
          </button>
        </div>
      </div>
      
      {/* Calendar Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            {currentMonthName}
          </span>
          
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button
            onClick={handleToday}
            className="ml-2 px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentView('month')}
            className={`px-3 py-1 text-sm font-medium rounded-md border ${
              currentView === 'month' 
                ? 'bg-primary-100 text-primary-800 border-primary-300 dark:bg-primary-900/30 dark:text-primary-200 dark:border-primary-800' 
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setCurrentView('week')}
            className={`px-3 py-1 text-sm font-medium rounded-md border ${
              currentView === 'week' 
                ? 'bg-primary-100 text-primary-800 border-primary-300 dark:bg-primary-900/30 dark:text-primary-200 dark:border-primary-800' 
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setCurrentView('day')}
            className={`px-3 py-1 text-sm font-medium rounded-md border ${
              currentView === 'day' 
                ? 'bg-primary-100 text-primary-800 border-primary-300 dark:bg-primary-900/30 dark:text-primary-200 dark:border-primary-800' 
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Day
          </button>
        </div>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-medium text-gray-900 dark:text-white">Filter Events</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="filter-event-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Event Type
              </label>
              <select
                id="filter-event-type"
                value={filters.eventType}
                onChange={(e) => setFilters({...filters, eventType: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="hearing">Court Hearing</option>
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="filter-case-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Associated Case
              </label>
              <select
                id="filter-case-id"
                value={filters.caseId}
                onChange={(e) => setFilters({...filters, caseId: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Cases</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="filter-assigned-to" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assigned To
              </label>
              <select
                id="filter-assigned-to"
                value={filters.assignedTo}
                onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">Anyone</option>
                {staff.map(person => (
                  <option key={person.id} value={person.id}>{person.first_name} {person.last_name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Simple Month View Calendar */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
          {days.map(day => (
            <div key={day} className="py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {calendarDays.map((dayObj, index) => {
            const dayEvents = getEventsForDay(dayObj.date);
            const isToday = dayObj.date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={`day-${dayObj.date.toISOString()}`} 
                className={`min-h-[120px] p-2 ${
                  dayObj.isCurrentMonth 
                    ? 'bg-white dark:bg-gray-800' 
                    : 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500'
                } ${
                  isToday 
                    ? 'ring-2 ring-inset ring-primary-500 dark:ring-primary-400' 
                    : ''
                }`}
                onClick={() => {
                  setSelectedEvent({
                    start_time: dayObj.date.toISOString(),
                    end_time: new Date(dayObj.date.getTime() + 3600000).toISOString(),
                    all_day: false
                  });
                  setShowModal(true);
                }}
              >
                <div className="font-medium text-sm mb-1">
                  {dayObj.date.getDate()}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-24">
                  {dayEvents.slice(0, 3).map(event => renderEventWithBadge(event))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pl-2">
                      + {dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Event Modal */}
      {showModal && (
        <EventModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          cases={cases}
          staff={staff}
        />
      )}
    </div>
  );
};

export default Calendar;
