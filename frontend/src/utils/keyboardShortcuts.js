import React from 'react';
import { useEffect, useState } from 'react';
import { toast } from './notification';

// Keyboard shortcut definitions
export const SHORTCUTS = {
  GLOBAL: {
    SHOW_SHORTCUTS: { key: '?', description: 'Show keyboard shortcuts' },
    SEARCH: { key: '/', description: 'Focus search' },
    NAVIGATE_HOME: { key: 'g h', description: 'Go to home' },
    NAVIGATE_CASES: { key: 'g c', description: 'Go to cases' },
    NAVIGATE_CLIENTS: { key: 'g l', description: 'Go to clients' },
    NAVIGATE_DOCUMENTS: { key: 'g d', description: 'Go to documents' },
    NAVIGATE_BILLING: { key: 'g b', description: 'Go to billing' },
    NAVIGATE_CALENDAR: { key: 'g a', description: 'Go to calendar' },
    TOGGLE_DARK_MODE: { key: 'Shift+D', description: 'Toggle dark mode' },
  },
  CASES: {
    NEW_CASE: { key: 'n c', description: 'New case' },
    SEARCH_CASES: { key: 'f c', description: 'Search cases' },
  },
  DOCUMENTS: {
    UPLOAD: { key: 'n d', description: 'Upload document' },
    SEARCH_DOCUMENTS: { key: 'f d', description: 'Search documents' },
  },
  BILLING: {
    NEW_TIME_ENTRY: { key: 'n t', description: 'New time entry' },
    NEW_INVOICE: { key: 'n i', description: 'New invoice' },
  },
};

// Track key sequence for multi-key shortcuts
let keySequence = [];
let keySequenceTimer = null;

// Hook to register keyboard shortcuts
export const useKeyboardShortcuts = (navigate, customShortcuts = {}) => {
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  
  useEffect(() => {
    const resetKeySequence = () => {
      keySequence = [];
    };
    
    const handleKeyDown = (event) => {
      // Skip if an input element is focused
      if (
        event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.isContentEditable
      ) {
        return;
      }
      
      // Clear any existing timer when a new key is pressed
      if (keySequenceTimer) clearTimeout(keySequenceTimer);
      
      // Convert key combination to string representation
      const key = event.key.toLowerCase();
      let keyString = key;
      
      if (event.ctrlKey) keyString = `Ctrl+${keyString}`;
      if (event.altKey) keyString = `Alt+${keyString}`;
      if (event.shiftKey) keyString = `Shift+${keyString}`;
      if (event.metaKey) keyString = `Meta+${keyString}`;

      // For multi-key sequences (e.g., 'g h')
      if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
        keySequence.push(key);
        keySequenceTimer = setTimeout(resetKeySequence, 1000);
        keyString = keySequence.join(' ');
      }
      
      // Show shortcuts helper
      if (keyString === SHORTCUTS.GLOBAL.SHOW_SHORTCUTS.key) {
        event.preventDefault();
        setShortcutsModalOpen(true);
        return;
      }
      
      // Focus search
      if (keyString === SHORTCUTS.GLOBAL.SEARCH.key) {
        event.preventDefault();
        const searchInput = document.getElementById('search');
        if (searchInput) searchInput.focus();
        return;
      }
      
      // Navigation shortcuts
      if (keyString === SHORTCUTS.GLOBAL.NAVIGATE_HOME.key) {
        event.preventDefault();
        navigate('/');
        toast.info('Navigated to Home');
        resetKeySequence();
        return;
      }
      
      if (keyString === SHORTCUTS.GLOBAL.NAVIGATE_CASES.key) {
        event.preventDefault();
        navigate('/cases');
        toast.info('Navigated to Cases');
        resetKeySequence();
        return;
      }
      
      if (keyString === SHORTCUTS.GLOBAL.NAVIGATE_CLIENTS.key) {
        event.preventDefault();
        navigate('/clients');
        toast.info('Navigated to Clients');
        resetKeySequence();
        return;
      }
      
      if (keyString === SHORTCUTS.GLOBAL.NAVIGATE_DOCUMENTS.key) {
        event.preventDefault();
        navigate('/documents');
        toast.info('Navigated to Documents');
        resetKeySequence();
        return;
      }
      
      if (keyString === SHORTCUTS.GLOBAL.NAVIGATE_BILLING.key) {
        event.preventDefault();
        navigate('/billing');
        toast.info('Navigated to Billing');
        resetKeySequence();
        return;
      }
      
      if (keyString === SHORTCUTS.GLOBAL.NAVIGATE_CALENDAR.key) {
        event.preventDefault();
        navigate('/calendar');
        toast.info('Navigated to Calendar');
        resetKeySequence();
        return;
      }
      
      // Handle custom shortcuts
      for (const [action, handler] of Object.entries(customShortcuts)) {
        const shortcutKey = 
          SHORTCUTS.CASES[action]?.key || 
          SHORTCUTS.DOCUMENTS[action]?.key || 
          SHORTCUTS.BILLING[action]?.key;
          
        if (shortcutKey && keyString === shortcutKey) {
          event.preventDefault();
          handler();
          resetKeySequence();
          return;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (keySequenceTimer) clearTimeout(keySequenceTimer);
    };
  }, [navigate, customShortcuts]);
  
  return { shortcutsModalOpen, setShortcutsModalOpen };
};

// Shortcut display helper for keyboard key indicators
export const KeyboardShortcutKey = ({ shortcut }) => {
  const keys = shortcut.split('+').length > 1 ? shortcut.split('+') : shortcut.split(' ');
  
  return (
    <div className="inline-flex items-center space-x-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
            {key}
          </kbd>
          {index < keys.length - 1 && shortcut.includes(' ') && (
            <span className="text-gray-500 dark:text-gray-400">then</span>
          )}
          {index < keys.length - 1 && shortcut.includes('+') && (
            <span className="text-gray-500 dark:text-gray-400">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
