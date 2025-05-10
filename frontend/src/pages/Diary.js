import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ArrowPathIcon,
  BookOpenIcon, 
  PencilIcon,
  TrashIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../utils/api';
import { toast } from '../utils/notification';

const Diary = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    case: '',
    tags: ''
  });
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetchEntries();
    fetchCases();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      // We'll reuse the calendar API endpoints but adapt the UI to a diary format
      const data = await apiRequest('/api/calendar/events/');
      
      // Transform calendar events into diary entries
      const transformedData = data.map(event => ({
        id: event.id,
        title: event.title,
        date: event.start_time.split('T')[0],
        content: event.description || '',
        case: event.case,
        case_details: event.case_details,
        tags: event.event_type,
        created_at: event.created_at,
        updated_at: event.updated_at
      }));
      
      setEntries(transformedData || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch diary entries:', err);
      setError('Failed to load diary entries. Please try again.');
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Transform diary entry to calendar event format for API
      const payload = {
        title: formData.title,
        description: formData.content,
        event_type: formData.tags || 'other',
        start_time: `${formData.date}T00:00:00`,
        end_time: `${formData.date}T23:59:59`,
        all_day: true,
        case: formData.case || null
      };
      
      if (editingEntry) {
        await apiRequest(`/api/calendar/events/${editingEntry.id}/`, 'PUT', payload);
        toast.success('Diary entry updated successfully');
      } else {
        await apiRequest('/api/calendar/events/', 'POST', payload);
        toast.success('Diary entry created successfully');
      }
      
      // Reset form and refresh entries
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        content: '',
        case: '',
        tags: ''
      });
      
      setShowNewEntryForm(false);
      setEditingEntry(null);
      fetchEntries();
    } catch (err) {
      console.error('Error saving diary entry:', err);
      toast.error('Failed to save diary entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      date: entry.date,
      content: entry.content,
      case: entry.case,
      tags: entry.tags
    });
    setShowNewEntryForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this diary entry?')) return;
    
    try {
      await apiRequest(`/api/calendar/events/${id}/`, 'DELETE');
      setEntries(entries.filter(entry => entry.id !== id));
      toast.success('Diary entry deleted successfully');
    } catch (err) {
      console.error('Error deleting diary entry:', err);
      toast.error('Failed to delete diary entry');
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

  if (loading && entries.length === 0) {
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Legal Diary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Keep track of your case notes, thoughts, and important information</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchEntries}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingEntry(null);
              setFormData({
                title: '',
                date: new Date().toISOString().split('T')[0],
                content: '',
                case: '',
                tags: ''
              });
              setShowNewEntryForm(!showNewEntryForm);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Entry
          </button>
        </div>
      </div>

      {showNewEntryForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingEntry ? 'Edit Diary Entry' : 'New Diary Entry'}
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
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Entry Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                rows="6"
                value={formData.content}
                onChange={handleFormChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Write your diary entry here..."
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Entry Type
                </label>
                <select
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="meeting">Meeting Notes</option>
                  <option value="research">Legal Research</option>
                  <option value="client">Client Communication</option>
                  <option value="court">Court Proceedings</option>
                  <option value="strategy">Case Strategy</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewEntryForm(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

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

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No diary entries yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start documenting your legal work by creating a new diary entry.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setEditingEntry(null);
                setFormData({
                  title: '',
                  date: new Date().toISOString().split('T')[0],
                  content: '',
                  case: '',
                  tags: ''
                });
                setShowNewEntryForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Diary Entry
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{entry.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(entry.date)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  {entry.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
                
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {entry.case && entry.case_details && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <BriefcaseIcon className="h-3 w-3 mr-1" />
                      {entry.case_details.title}
                    </span>
                  )}
                  {entry.tags && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {entry.tags}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Diary;
