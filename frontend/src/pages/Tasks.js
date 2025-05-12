import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  ClockIcon,
  PlusIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../utils/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'overdue', 'upcoming'

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/tasks/');
      setTasks(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.status === 'completed';
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

  // Rest of the component code...
  return (
    <div>
      <h1>Tasks</h1>
      {/* Component content */}
    </div>
  );
};

export default Tasks;