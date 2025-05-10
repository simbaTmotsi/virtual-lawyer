import React, { useState } from 'react';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 300,
  className = '',
  variant = 'dark'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTip = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  // Position class mapping
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  // Arrow position classes
  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 dark:border-t-gray-200 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 dark:border-b-gray-200 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 dark:border-l-gray-200 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 dark:border-r-gray-200 border-t-transparent border-b-transparent border-l-transparent'
  };

  // Variant classes
  const variantClasses = {
    dark: 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800',
    light: 'bg-white text-gray-800 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600',
    primary: 'bg-primary-600 text-white'
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`absolute z-50 whitespace-nowrap rounded px-2 py-1 text-xs font-medium ${positionClasses[position]} ${variantClasses[variant]}`}
          role="tooltip"
        >
          {content}
          <div 
            className={`absolute w-2 h-2 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
