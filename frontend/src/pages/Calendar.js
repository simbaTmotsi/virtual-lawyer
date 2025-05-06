import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { apiRequest } from '../utils/api';
import EventModal from '../components/calendar/EventModal';

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
  const calendarRef = useRef(null);
  
  // Fetch events, cases, and staff data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsData, casesData, staffData] = await Promise.all([
          apiRequest('/api/calendar/events/'),
          apiRequest('/api/cases/'),
          apiRequest('/api/users/?role=attorney') // Fetch attorneys and other staff
        ]);
        
        // Format events for FullCalendar
        const formattedEvents = eventsData.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start_time,
          end: event.end_time || event.start_time, // Use start_time as fallback
          allDay: event.all_day,
          extendedProps: {
            description: event.description,
            location: event.location,
            eventType: event.event_type,
            caseId: event.case,
            attendees: event.attendees
          },
          backgroundColor: getEventColor(event.event_type),
          borderColor: getEventColor(event.event_type)
        }));
        
        setEvents(formattedEvents);
        setCases(casesData);
        setStaff(staffData);
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
      case 'meeting': return '#4F46E5'; // Indigo
      case 'deadline': return '#EF4444'; // Red
      case 'hearing': return '#F59E0B'; // Amber
      case 'task': return '#10B981'; // Green
      case 'reminder': return '#6366F1'; // Purple
      default: return '#6B7280'; // Gray
    }
  };
  
  // Handle date navigation
  const handlePrev = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
  };
  
  const handleNext = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
  };
  
  const handleToday = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
  };
  
  // Handle view changes
  const handleViewChange = (viewType) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(viewType);
  };
  
  // Event handlers
  const handleDateSelect = (selectInfo) => {
    // Open create event modal with pre-filled date/time
    setSelectedEvent({
      start_time: selectInfo.startStr,
      end_time: selectInfo.endStr,
      all_day: selectInfo.allDay
    });
    setShowModal(true);
  };
  
  const handleEventClick = (clickInfo) => {
    // Open edit event modal with event data
    const event = clickInfo.event;
    const extendedProps = event.extendedProps;
    
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start_time: event.startStr,
      end_time: event.endStr,
      all_day: event.allDay,
      description: extendedProps.description,
      location: extendedProps.location,
      event_type: extendedProps.eventType,
      case: extendedProps.caseId,
      attendees: extendedProps.attendees
    });
    setShowModal(true);
  };
  
  // Save an event (create or update)
  const handleSaveEvent = async (eventData) => {
    try {
      setLoading(true);
      let savedEvent;
      
      if (eventData.id) {
        // Update existing event
        savedEvent = await apiRequest(`/api/calendar/events/${eventData.id}/`, 'PUT', eventData);
      } else {
        // Create new event
        savedEvent = await apiRequest('/api/calendar/events/', 'POST', eventData);
      }
      
      // Update events list
      if (eventData.id) {
        setEvents(events.map(e => e.id === savedEvent.id ? {
          id: savedEvent.id,
          title: savedEvent.title,
          start: savedEvent.start_time,
          end: savedEvent.end_time,
          allDay: savedEvent.all_day,
          extendedProps: {
            description: savedEvent.description,
            location: savedEvent.location,
            eventType: savedEvent.event_type,
            caseId: savedEvent.case,
            attendees: savedEvent.attendees
          },
          backgroundColor: getEventColor(savedEvent.event_type),
          borderColor: getEventColor(savedEvent.event_type)
        } : e));
      } else {
        setEvents([...events, {
          id: savedEvent.id,
          title: savedEvent.title,
          start: savedEvent.start_time,
          end: savedEvent.end_time,
          allDay: savedEvent.all_day,
          extendedProps: {
            description: savedEvent.description,
            location: savedEvent.location,
            eventType: savedEvent.event_type,
            caseId: savedEvent.case,
            attendees: savedEvent.attendees
          },
          backgroundColor: getEventColor(savedEvent.event_type),
          borderColor: getEventColor(savedEvent.event_type)
        }]);
      }
      
      setShowModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to save event:', err);
      // This could be improved with better error handling
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
  const handleApplyFilters = () => {
    // In a real implementation, this would likely be a server-side filter
    // For this demo, we'll filter client-side
    const fetchFilteredEvents = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams();
        if (filters.eventType) params.append('event_type', filters.eventType);
        if (filters.caseId) params.append('case', filters.caseId);
        if (filters.assignedTo) params.append('attendee', filters.assignedTo);
        
        const eventsData = await apiRequest(`/api/calendar/events/?${params.toString()}`);
        
        // Format events for FullCalendar
        const formattedEvents = eventsData.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start_time,
          end: event.end_time || event.start_time,
          allDay: event.all_day,
          extendedProps: {
            description: event.description,
            location: event.location,
            eventType: event.event_type,
            caseId: event.case,
            attendees: event.attendees
          },
          backgroundColor: getEventColor(event.event_type),
          borderColor: getEventColor(event.event_type)
        }));
        
        setEvents(formattedEvents);
      } catch (err) {
        console.error('Failed to fetch filtered events:', err);
        setError('Failed to apply filters. Please try again.');
      } finally {
        setLoading(false);
        setShowFilters(false);
      }
    };
    
    fetchFilteredEvents();
  };
  
  // Clear all filters
  const handleResetFilters = () => {
    setFilters({
      eventType: '',
      caseId: '',
      assignedTo: ''
    });
    
    // Fetch all events again
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await apiRequest('/api/calendar/events/');
        
        // Format events for FullCalendar
        const formattedEvents = eventsData.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start_time,
          end: event.end_time || event.start_time,
          allDay: event.all_day,
          extendedProps: {
            description: event.description,
            location: event.location,
            eventType: event.event_type,
            caseId: event.case,
            attendees: event.attendees
          },
          backgroundColor: getEventColor(event.event_type),
          borderColor: getEventColor(event.event_type)
        }));
        
        setEvents(formattedEvents);
      } catch (err) {
        console.error('Failed to reset filters:', err);
        setError('Failed to reset filters. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllEvents();
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
            onClick={handlePrev}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Today
          </button>
          
          <button
            onClick={handleNext}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewChange('dayGridMonth')}
            className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange('timeGridWeek')}
            className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange('timeGridDay')}
            className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
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
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Event Type
              </label>
              <select
                id="eventType"
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
              <label htmlFor="caseId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Associated Case
              </label>
              <select
                id="caseId"
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
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assigned To
              </label>
              <select
                id="assignedTo"
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
      
      {/* Calendar */}
      <div>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false} // We're using our custom toolbar
          events={events}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
        />
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
