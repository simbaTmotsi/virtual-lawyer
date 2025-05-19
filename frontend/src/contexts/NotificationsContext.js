import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

// Create context
const NotificationsContext = React.createContext(null);

const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // First check authentication status using the public endpoint
      const statusResponse = await api.get('/api/notifications/status/');
      
      // Only fetch notifications if the user is authenticated
      if (statusResponse.data && statusResponse.data.authenticated) {
        const response = await api.get('/api/notifications/');
        const notificationData = response.data || [];
        setNotifications(notificationData);
        setUnreadCount(notificationData.filter(notification => !notification.read).length);
      } else {
        // User is not authenticated, just update unread count from status
        setUnreadCount(statusResponse.data?.unread_count || 0);
        setNotifications([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/`, { read: true });
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-read/');
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      return false;
    }
  };

  // Fetch notifications when the component mounts and set up polling
  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    
    // Set up polling for new notifications (every 2 minutes)
    const intervalId = setInterval(fetchNotifications, 120000); // Increased from 60s to 120s to reduce server load
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        loading, 
        error, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead 
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

// Hook for using the notifications context
export const useNotifications = () => {
  const context = React.useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export default NotificationsProvider;
