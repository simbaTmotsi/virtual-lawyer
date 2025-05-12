import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';

// Register all the Chart.js components we need
ChartJS.register(...registerables);

const ChartComponent = ({ type = 'bar', data, options = {} }) => {
  const chartRef = useRef(null);

  // Cleanup chart instance on unmount or when chart type/data changes
  useEffect(() => {
    // Create a ref to the current chart for cleanup
    const currentChartRef = chartRef.current;
    
    return () => {
      if (currentChartRef) {
        currentChartRef.destroy();
      }
    };
  }, [type, data]);

  // Set default options based on dark/light mode
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        }
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        titleColor: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
        bodyColor: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: type !== 'pie' && type !== 'radar' ? {
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
        }
      },
      y: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
        }
      }
    } : {}
  };

  // Merge default options with passed options
  const mergedOptions = { ...defaultOptions, ...options };

  // Ensure we have valid data to prevent errors
  if (!data || !data.datasets || !data.labels) {
    return <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <p className="text-gray-500 dark:text-gray-400">No data available</p>
    </div>;
  }

  // Render appropriate chart based on type
  switch (type) {
    case 'line':
      return <Line ref={chartRef} data={data} options={mergedOptions} redraw={true} />;
    case 'bar':
      return <Bar ref={chartRef} data={data} options={mergedOptions} redraw={true} />;
    case 'pie':
      return <Pie ref={chartRef} data={data} options={mergedOptions} redraw={true} />;
    case 'radar':
      return <Radar ref={chartRef} data={data} options={mergedOptions} redraw={true} />;
    default:
      return <Bar ref={chartRef} data={data} options={mergedOptions} redraw={true} />;
  }
};

export default ChartComponent;
