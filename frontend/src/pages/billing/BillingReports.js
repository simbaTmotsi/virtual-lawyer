import React, { useState, useEffect, useCallback } from "react";
import { 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  ClockIcon,
  ArrowPathIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';
import PlaceholderChart from "../../components/PlaceholderChart";

const BillingReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Available report types
  const reports = [
    { 
      id: 'revenue', 
      title: 'Revenue by Month', 
      description: 'Monthly revenue breakdown, invoiced vs. collected',
      icon: CurrencyDollarIcon,
      endpoint: '/api/billing/reports/revenue/',
      chartType: 'bar'
    },
    { 
      id: 'hours', 
      title: 'Billable Hours', 
      description: 'Billable hours tracked by attorney',
      icon: ClockIcon,
      endpoint: '/api/billing/reports/hours/',
      chartType: 'bar'
    },
    { 
      id: 'clients', 
      title: 'Top Clients', 
      description: 'Clients by billable amount',
      icon: UserGroupIcon,
      endpoint: '/api/billing/reports/clients/',
      chartType: 'pie'
    },
    { 
      id: 'aging', 
      title: 'Accounts Receivable Aging', 
      description: 'Outstanding invoices by age',
      icon: CalendarIcon,
      endpoint: '/api/billing/reports/aging/',
      chartType: 'bar'
    }
  ];

  // Memoize the fetchReportData function to avoid dependency issues
  const fetchReportData = useCallback(async () => {
    if (!currentReport) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Build query params for date range
      const params = new URLSearchParams();
      params.append('start_date', dateRange.startDate);
      params.append('end_date', dateRange.endDate);
      
      const endpoint = `${currentReport.endpoint}?${params.toString()}`;
      const data = await apiRequest(endpoint);
      
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setError('Failed to load report data. Please try again.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [currentReport, dateRange]);

  // Fetch report data when a report is selected or date range changes
  useEffect(() => {
    if (!currentReport) return;
    
    fetchReportData();
  }, [currentReport, dateRange, fetchReportData]);

  const handleSelectReport = (report) => {
    setCurrentReport(report);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prevRange => ({
      ...prevRange,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Billing Reports</h2>
        
        {currentReport && (
          <button 
            onClick={fetchReportData}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Report selection sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available Reports</h3>
            </div>
            <div className="p-4 space-y-1">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => handleSelectReport(report)}
                  className={`w-full text-left px-3 py-3 rounded-md flex items-center ${
                    currentReport?.id === report.id 
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <report.icon className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{report.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Report content area */}
        <div className="w-full lg:w-3/4">
          <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
            {currentReport ? (
              <>
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 md:mb-0">
                    {currentReport.title}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div>
                      <label htmlFor="startDate" className="block text-xs text-gray-500 dark:text-gray-400">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateRangeChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-xs text-gray-500 dark:text-gray-400">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateRangeChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                  ) : error ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center">
                        <p className="text-red-500 text-lg">{error}</p>
                        <button 
                          onClick={fetchReportData}
                          className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : reportData ? (
                    <div className="h-96">
                      {/* Replace with actual chart component from your library */}
                      <PlaceholderChart 
                        title={currentReport.title} 
                        type={currentReport.chartType} 
                        data={reportData}
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <DocumentTextIcon className="h-16 w-16 mx-auto mb-4" />
                        <p>No data available for the selected period.</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-96">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <DocumentTextIcon className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">Select a report from the sidebar to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingReports;