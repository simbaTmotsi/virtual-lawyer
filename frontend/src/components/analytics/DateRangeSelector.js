import React from 'react';

const DateRangeSelector = ({ startDate, endDate, onRangeChange }) => {
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    onRangeChange(newStartDate, endDate);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    onRangeChange(startDate, newEndDate);
  };

  // Predefined ranges
  const setLastWeek = () => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    onRangeChange(start, end);
  };

  const setLastMonth = () => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    onRangeChange(start, end);
  };

  const setLastQuarter = () => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    onRangeChange(start, end);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <label htmlFor="start-date" className="text-sm text-gray-600 dark:text-gray-300">
          Start:
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <label htmlFor="end-date" className="text-sm text-gray-600 dark:text-gray-300">
          End:
        </label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={setLastWeek}
          className="px-2 py-1 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Last Week
        </button>
        <button 
          onClick={setLastMonth}
          className="px-2 py-1 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Last Month
        </button>
        <button 
          onClick={setLastQuarter}
          className="px-2 py-1 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Last Quarter
        </button>
      </div>
    </div>
  );
};

export default DateRangeSelector;
