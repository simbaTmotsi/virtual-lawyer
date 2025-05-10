import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ArrowPathIcon,
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PencilIcon,
  TrashIcon,
  BriefcaseIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon // Add this missing icon import
} from '@heroicons/react/24/outline';
import apiRequest from '../utils/api';
import { toast } from '../utils/notification';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    caseId: '',
    dueDate: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
    priority: 'medium',
    status: 'pending',
    case: '',
    assignee: ''
  });
  const [cases, setCases] = useState([]);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchCases();
    fetchTeam();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // We'll reuse the calendar API endpoints with a filter for task events
      const data = await apiRequest('/api/calendar/events/?event_type=task');
      
      // Transform calendar events into task format
      const transformedData = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        due_date: event.start_time.split('T')[0],
        priority: event.event_type === 'deadline' ? 'high' : 'medium',
        status: new Date(event.start_time) < new Date() ? 'overdue' : 
                event.completed ? 'completed' : 'pending',
        case: event.case,
        case_details: event.case_details,
        assignee: event.attendees && event.attendees.length > 0 ? event.attendees[0] : null,
        created_at: event.created_at,
        updated_at: event.updated_at,
        completed: !!event.completed
      }));
      
      setTasks(transformedData || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const data = await apiRequest('/api/cases/');
      setCases(data || []);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    }
  };

  const fetchTeam = async () => {
    try {
      const data = await apiRequest('/api/users/team/');
      setTeam(data || []);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Transform task to calendar event format for API
      const payload = {
        title: formData.title,
        description: formData.description,
        event_type: 'task',
        start_time: `${formData.due_date}T23:59:59`,
        end_time: `${formData.due_date}T23:59:59`,
        all_day: true,
        case: formData.case || null,
        attendees: formData.assignee ? [formData.assignee] : [],
        metadata: {
          priority: formData.priority,
          status: formData.status,
        }
      };
      
      if (editingTask) {
        await apiRequest(`/api/calendar/events/${editingTask.id}/`, 'PUT', payload);
        toast.success('Task updated successfully');
      } else {
        await apiRequest('/api/calendar/events/', 'POST', payload);
        toast.success('Task created successfully');
      }
      
      // Reset form and refresh tasks
      setFormData({
        title: '',
        description: '',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium',
        status: 'pending',
        case: '',
        assignee: ''
      });
      
      setShowNewTaskForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('Error saving task:', err);
      toast.error('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      priority: task.priority,
      status: task.status,
      case: task.case,
      assignee: task.assignee ? task.assignee.id : ''
    });
    setShowNewTaskForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await apiRequest(`/api/calendar/events/${id}/`, 'DELETE');
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task');
    }
  };

  const handleMarkComplete = async (task) => {
    try {
      const updatedTask = {...task, status: 'completed', completed: true};
      
      // Transform back to calendar event for API
      const payload = {
        title: task.title,
        description: task.description,
        event_type: 'task',
        start_time: `${task.due_date}T23:59:59`,
        end_time: `${task.due_date}T23:59:59`, 
        all_day: true,
        case: task.case,
        attendees: task.assignee ? [task.assignee.id] : [],
        completed: true
      };
      
      await apiRequest(`/api/calendar/events/${task.id}/`, 'PUT', payload);
      
      // Update local state
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
      toast.success('Task marked as complete');
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    }
  };

  const applyFilters = () => {
    fetchTasks().then(() => {
      // Filter tasks based on the filter criteria
      let filteredTasks = [...tasks];
      
      if (filters.status) {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }
      
      if (filters.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
      }
      
      if (filters.caseId) {
        filteredTasks = filteredTasks.filter(task => task.case === filters.caseId);
      }
      
      if (filters.dueDate) {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        switch(filters.dueDate) {
          case 'today':
            filteredTasks = filteredTasks.filter(task => task.due_date === today);
            break;
          case 'tomorrow':
            filteredTasks = filteredTasks.filter(task => task.due_date === tomorrow);
            break;
          case 'week':
            filteredTasks = filteredTasks.filter(task => 
              task.due_date >= today && task.due_date <= nextWeek
            );
            break;
          case 'overdue':
            filteredTasks = filteredTasks.filter(task => 
              task.due_date < today && task.status !== 'completed'
            );
            break;
        }
      }
      
      setTasks(filteredTasks);
      setShowFilters(false);
    });
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      caseId: '',
      dueDate: ''
    });
    fetchTasks();
    setShowFilters(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  const renderPriorityBadge = (priority) => {
    switch(priority) {
      case 'high':
        return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs px-2 py-1 rounded-full">High</span>;
      case 'medium':
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-2 py-1 rounded-full">Medium</span>;
      case 'low':
        return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded-full">Low</span>;
      default:
        return null;
    }
  };

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded-full">Completed</span>;
      case 'pending':
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-1 rounded-full">Pending</span>;
      case 'overdue':
        return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs px-2 py-1 rounded-full">Overdue</span>;
      default:
        return null;
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your legal work and deadlines</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Filter
          </button>
          <button
            onClick={fetchTasks}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingTask(null);
              setFormData({
                title: '',
                description: '',
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                priority: 'medium',
                status: 'pending',
                case: '',
                assignee: ''
              });
              setShowNewTaskForm(!showNewTaskForm);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filter Tasks</h2>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status-filter"
                name="status"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                id="priority-filter"
                name="priority"
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="case-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Case
              </label>
              <select
                id="case-filter"
                name="case"
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
              <label htmlFor="duedate-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Date
              </label>
              <select
                id="duedate-filter"
                name="dueDate"
                value={filters.dueDate}
                onChange={(e) => setFilters({...filters, dueDate: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* New/Edit Task Form */}
      {showNewTaskForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Task details..."
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label htmlFor="case" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Related Case
                </label>
                <select
                  id="case"
                  name="case"
                  value={formData.case}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">None</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assigned To
                </label>
                <select
                  id="assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {team.map(person => (
                    <option key={person.id} value={person.id}>{person.first_name} {person.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewTaskForm(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {editingTask ? 'Update Task' : 'Save Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new task.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setEditingTask(null);
                setFormData({
                  title: '',
                  description: '',
                  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  priority: 'medium',
                  status: 'pending',
                  case: '',
                  assignee: ''
                });
                setShowNewTaskForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Task
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => (
              <li key={task.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                task.status === 'completed' ? 'bg-gray-50 dark:bg-gray-900/30' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    {task.status === 'completed' ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
                    ) : (
                      <button 
                        onClick={() => handleMarkComplete(task)}
                        className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400"
                      />
                    )}
                    <div>
                      <h3 className={`text-sm font-medium ${
                        task.status === 'completed' 
                          ? 'text-gray-500 dark:text-gray-400 line-through' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {renderPriorityBadge(task.priority)}
                        {renderStatusBadge(task.status)}
                        
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {formatDate(task.due_date)}
                        </span>
                        
                        {task.case_details && (
                          <span className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                            <BriefcaseIcon className="mr-1 h-3 w-3" />
                            {task.case_details.title}
                          </span>
                        )}
                        
                        {task.assignee && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Assigned to: {task.assignee.first_name} {task.assignee.last_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Tasks;
