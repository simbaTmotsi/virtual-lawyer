import React, { useState, useEffect, useMemo } from 'react';
import { getGoogleApiMetrics } from '../../../utils/apiClient'; // Adjust path
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the adapter

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Register TimeScale
);

const ApiUsageMetricsPage = () => {
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    metric_date_after: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Default to last 30 days
    metric_date_before: new Date().toISOString().split('T')[0],
    service_name: '', // Example: 'Vertex AI API'
    metric_name: '',  // Example: 'aiplatform.googleapis.com/prediction/request/count' or 'billing/cost'
  });

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilters = { ...filters };
      if (!activeFilters.service_name) delete activeFilters.service_name;
      if (!activeFilters.metric_name) delete activeFilters.metric_name;
      const data = await getGoogleApiMetrics(activeFilters);
      setMetrics(data || []);
    } catch (err) {
      setError(err.message || 'An error occurred');
      setMetrics([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch on initial load. 

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchMetrics();
  };

  // Memoized chart data processing
  const chartData = useMemo(() => {
    if (!metrics || metrics.length === 0) {
      return { labels: [], datasets: [] };
    }

    const groupedByMetric = metrics.reduce((acc, m) => {
      const key = `${m.service_name} - ${m.metric_name} (${m.unit})`;
      if (!acc[key]) {
        acc[key] = {
          label: key,
          data: [],
          borderColor: `hsl(${Object.keys(acc).length * 60}, 70%, 50%)`, 
          tension: 0.1,
          fill: false,
        };
      }
      acc[key].data.push({ x: new Date(m.metric_date), y: m.metric_value !== null ? Number(m.metric_value) : parseFloat(m.cost) });
      return acc;
    }, {});
    
    Object.values(groupedByMetric).forEach(dataset => {
       dataset.data.sort((a, b) => a.x - b.x);
    });

    return { datasets: Object.values(groupedByMetric) };
  }, [metrics]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM dd, yyyy',
          displayFormats: {
            day: 'MMM dd'
          }
        },
        title: { display: true, text: 'Date', color: '#cbd5e1' }, // Dark theme text color
        ticks: { color: '#94a3b8' }, // Dark theme ticks color
        grid: { color: '#374151' }, // Dark theme grid color
      },
      y: { 
        beginAtZero: true,
        title: { display: true, text: 'Value / Cost', color: '#cbd5e1' }, // Dark theme text color
        ticks: { color: '#94a3b8' }, // Dark theme ticks color
        grid: { color: '#374151' }, // Dark theme grid color
      }
    },
    plugins: {
      legend: { position: 'top', labels: { color: '#e5e7eb' } }, // Dark theme legend text color
      title: { display: true, text: 'API Usage Metrics Over Time', color: '#f3f4f6' } // Dark theme title text color
    }
  };
  
  return (
    <div className="p-4 md:p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-100">Google API Usage Metrics</h1>
      
      <form onSubmit={handleFilterSubmit} className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="metric_date_after" className="block text-sm font-medium text-gray-300">From:</label>
          <input type="date" name="metric_date_after" value={filters.metric_date_after} onChange={handleFilterChange} className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"/>
        </div>
        <div>
          <label htmlFor="metric_date_before" className="block text-sm font-medium text-gray-300">To:</label>
          <input type="date" name="metric_date_before" value={filters.metric_date_before} onChange={handleFilterChange} className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"/>
        </div>
        <div>
          <label htmlFor="service_name" className="block text-sm font-medium text-gray-300">Service Name (Optional):</label>
          <input type="text" name="service_name" value={filters.service_name} onChange={handleFilterChange} placeholder="e.g., Vertex AI API" className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"/>
        </div>
        <div>
          <label htmlFor="metric_name" className="block text-sm font-medium text-gray-300">Metric Name (Optional):</label>
          <input type="text" name="metric_name" value={filters.metric_name} onChange={handleFilterChange} placeholder="e.g., billing/cost" className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"/>
        </div>
        <div className="md:col-span-2 lg:col-span-1 flex items-end">
           <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
             {isLoading ? 'Loading...' : 'Apply Filters'}
           </button>
        </div>
      </form>

      {error && <div className="my-4 p-3 bg-red-800/50 text-red-100 border border-red-700 rounded-md">Error: {error}</div>}
      
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6" style={{ height: '400px' }}>
        {isLoading && <p className="text-center text-gray-400">Loading chart...</p>}
        {!isLoading && metrics.length > 0 && <Line options={chartOptions} data={chartData} />}
        {!isLoading && metrics.length === 0 && !error && <p className="text-center text-gray-400">No data available for the selected filters to display in chart.</p>}
      </div>

      <h2 className="text-xl md:text-2xl font-semibold mb-4 mt-8 text-gray-100">Raw Data</h2>
      {isLoading && <p className="text-center text-gray-400">Loading data...</p>}
      {!isLoading && metrics.length > 0 && (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                {['Date', 'Service', 'Metric', 'Value', 'Cost', 'Unit'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {metrics.map((metric, index) => (
                <tr key={metric.id || index} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{metric.metric_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{metric.service_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{metric.metric_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{metric.metric_value !== null ? metric.metric_value.toString() : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{metric.cost !== null ? `$${parseFloat(metric.cost).toFixed(2)}` : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{metric.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && metrics.length === 0 && !error && <p className="text-center text-gray-400">No raw data available for the selected filters.</p>}
    </div>
  );
};

export default ApiUsageMetricsPage;
