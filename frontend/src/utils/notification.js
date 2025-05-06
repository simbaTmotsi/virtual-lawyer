// Simple notification utility to replace react-toastify

// Store for active notifications
let notifications = [];
let notificationId = 0;

// Create a container for notifications if it doesn't exist
const getContainer = () => {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '1rem';
    container.style.right = '1rem';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '0.5rem';
    document.body.appendChild(container);
  }
  return container;
};

// Create a notification element
const createNotificationElement = (id, message, type) => {
  const element = document.createElement('div');
  element.id = `notification-${id}`;
  element.style.padding = '1rem';
  element.style.borderRadius = '0.375rem';
  element.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
  element.style.marginBottom = '0.5rem';
  element.style.width = '300px';
  element.style.animation = 'fadeIn 0.3s ease-out';
  element.style.transition = 'all 0.3s ease-out';
  
  // Set colors based on type
  if (type === 'success') {
    element.style.backgroundColor = '#10B981';
    element.style.color = 'white';
  } else if (type === 'error') {
    element.style.backgroundColor = '#EF4444';
    element.style.color = 'white';
  } else if (type === 'warning') {
    element.style.backgroundColor = '#F59E0B';
    element.style.color = 'white';
  } else {
    element.style.backgroundColor = '#3B82F6';
    element.style.color = 'white';
  }
  
  element.textContent = message;
  
  return element;
};

// Add a notification
const addNotification = (message, type, duration = 3000) => {
  const container = getContainer();
  const id = notificationId++;
  const element = createNotificationElement(id, message, type);
  
  container.appendChild(element);
  notifications.push({ id, element, timeout: setTimeout(() => removeNotification(id), duration) });
  
  return id;
};

// Remove a notification
const removeNotification = (id) => {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    clearTimeout(notification.timeout);
    notification.element.style.opacity = '0';
    setTimeout(() => {
      notification.element.remove();
      notifications = notifications.filter(n => n.id !== id);
    }, 300);
  }
};

// Create style for animations
const createAnimationStyle = () => {
  if (!document.getElementById('notification-style')) {
    const style = document.createElement('style');
    style.id = 'notification-style';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateX(2rem); }
        to { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }
};

// Initialize
createAnimationStyle();

// Export utility functions
export const toast = {
  success: (message, duration) => addNotification(message, 'success', duration),
  error: (message, duration) => addNotification(message, 'error', duration),
  warning: (message, duration) => addNotification(message, 'warning', duration),
  info: (message, duration) => addNotification(message, 'info', duration),
};
