import React from 'react';
import { ChartBarIcon, ChartPieIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

// Placeholder chart component - in a real app, you'd use a library like Chart.js or Recharts
const ChartComponent = ({ title, type = 'bar', data }) => {
  const ChartIcon = type === 'pie' ? ChartPieIcon : 
                    type === 'line' ? ArrowTrendingUpIcon : 
                    ChartBarIcon;

  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-64 flex flex-col items-center justify-center">
      <ChartIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-3" />
      <p className="text-gray-500 dark:text-gray-400 text-center">
        {title ? `${title} Chart` : 'Chart'} Visualization
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
        {data ? `${data.labels?.length || 0} data points available` : 'No data available'}
      </p>
      {data && data.labels && (
        <div className="mt-4 text-xs text-gray-500 w-full max-w-md">
          <p className="text-center font-semibold mb-1">Data Preview:</p>
          <div className="grid grid-cols-2 gap-1">
            <div className="text-left">Labels:</div>
            <div className="text-right">{data.labels.slice(0, 3).join(', ')}{data.labels.length > 3 ? '...' : ''}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartComponent;
