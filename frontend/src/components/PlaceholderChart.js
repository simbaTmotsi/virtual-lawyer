import React from 'react';
import { ChartBarIcon, ChartPieIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const PlaceholderChart = ({ title = 'Chart', type = 'bar' }) => {
  const ChartIcon = type === 'pie' ? ChartPieIcon : 
                    type === 'line' ? ArrowTrendingUpIcon : 
                    ChartBarIcon;

  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-64 flex flex-col items-center justify-center">
      <ChartIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-3" />
      <p className="text-gray-500 dark:text-gray-400 text-center">
        {title ? `${title} Chart` : 'Chart'} Placeholder
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
        Data visualization will appear here
      </p>
    </div>
  );
};

export default PlaceholderChart;
