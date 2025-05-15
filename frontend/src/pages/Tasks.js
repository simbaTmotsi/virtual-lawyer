import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon,
  PlusIcon,
  CalendarIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../utils/api';
import { toast } from '../utils/notification';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'overdue', 'upcoming'
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    case: '',
    completed: false
  });
  const [cases, setCases] = useState([]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get('/api/tasks/');
      setTasks(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCases = useCallback(async () => {
    try {
      const response = await apiRequest.get('/api/cases/');
      setCases(response.data || []);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchCases();
  }, [fetchTasks, fetchCases]);

  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'overdue') {
      const dueDate = new Date(task.due_date);
      return !task.completed && dueDate < new Date();
    }
    if (filter === 'upcoming') {
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return !task.completed && dueDate >= today && dueDate <= nextWeek;
    }
    return true;
  });

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingTask) {
        await apiRequest.put(`/api/tasks/${editingTask.id}/`, formData);
        toast.success('Task updated successfully');
      } else {
        await apiRequest.post('/api/tasks/', formData);
        toast.success('Task created successfully');
      }
      
      // Reset form and refresh tasks
      setFormData({
        title: '',
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        case: '',
        completed: false
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

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await apiRequest.patch(`/api/tasks/${task.id}/`, { completed: !task.completed });
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
      toast.success(`Task marked as ${updatedTask.completed ? 'completed' : 'incomplete'}`);
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task status');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date,
      priority: task.priority || 'medium',
      case: task.case || '',
      completed: task.completed
    });
    setShowNewTaskForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await apiRequest.delete(`/api/tasks/${id}/`);
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  const isPastDue = (dateString) => {
    const dueDate = new Date(dateString);
    return !isNaN(dueDate) && dueDate < new Date() ? true : false;
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks & Deadlines</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your tasks, deadlines, and reminders</p>
        </div>
        <div className="flex space-x-3">
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
                due_date: new Date().toISOString().split('T')[0],
                priority: 'medium',
                case: '',
                completed: false
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

      {/* Task filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-full text-sm ${
                filter === 'all' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-2 rounded-full text-sm ${
                filter === 'upcoming' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <CalendarIcon className="inline h-4 w-4 mr-1" />
              Upcoming (7 days)
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-2 rounded-full text-sm ${
                filter === 'overdue' 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />
              Overdue
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-2 rounded-full text-sm ${
                filter === 'completed' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <CheckCircleIcon className="inline h-4 w-4 mr-1" />
              Completed
            </button>
          </div>

          {showNewTaskForm && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      id="due_date"
                      required
                      value={formData.due_date}
                      onChange={handleFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <select
                      name="priority"
                      id="priority"
                      value={formData.priority}
                      onChange={handleFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="case" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Related Case
                    </label>
                    <select
                      name="case"
                      id="case"
                      value={formData.case}
                      onChange={handleFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                      <option value="">None</option>
                      {cases.map(c => (
                        <option key={c.id} value={c.id}>{c.title || c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="completed"
                    id="completed"
                    checked={formData.completed}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="completed" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Mark as completed
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewTaskForm(false);
                      setEditingTask(null);
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!error && filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filter === 'all' ? 'You have no tasks yet.' : `No ${filter} tasks found.`}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  View all tasks
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <li key={task.id} className="py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <button 
                        onClick={() => handleToggleComplete(task)} 
                        className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          task.completed 
                            ? 'bg-green-500 text-white' 
                            : 'border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {task.completed && <CheckCircleIcon className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          task.completed 
                            ? 'text-gray-400 dark:text-gray-500 line-through' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {task.title}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(task)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className={`mt-1 text-sm ${
                          task.completed 
                            ? 'text-gray-400 dark:text-gray-500' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isPastDue(task.due_date) && !task.completed
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          <ClockIcon className="mr-1 h-3 w-3" />
                          {formatDate(task.due_date)}
                          {isPastDue(task.due_date) && !task.completed && ' (Overdue)'}
                        </span>
                        
                        {task.priority && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === 'urgent' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : task.priority === 'high'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        )}
                        
                        {task.case && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {cases.find(c => c.id === task.case)?.title || task.case}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;