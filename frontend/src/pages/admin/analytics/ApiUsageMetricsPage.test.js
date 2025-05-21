import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApiUsageMetricsPage from './ApiUsageMetricsPage';
import * as apiClient from '../../../utils/apiClient';

// Mock the apiClient
jest.mock('../../../utils/apiClient');

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="mock-line-chart" /> // Mock Line component
}));

describe('ApiUsageMetricsPage', () => {
  const mockMetricsData = [
    { id: 1, metric_date: '2023-10-01', service_name: 'Vertex AI API', metric_name: 'requests', metric_value: 100, cost: null, unit: 'count' },
    { id: 2, metric_date: '2023-10-01', service_name: 'Vertex AI API', metric_name: 'billing/cost', metric_value: null, cost: '10.50', unit: 'USD' },
    { id: 3, metric_date: '2023-10-02', service_name: 'Vertex AI API', metric_name: 'requests', metric_value: 120, cost: null, unit: 'count' },
    { id: 4, metric_date: '2023-10-02', service_name: 'Vertex AI API', metric_name: 'billing/cost', metric_value: null, cost: '12.60', unit: 'USD' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    apiClient.getGoogleApiMetrics.mockResolvedValue(mockMetricsData); // Default mock for successful fetch
  });

  test('renders the page and form elements correctly', async () => {
    render(<ApiUsageMetricsPage />);
    expect(screen.getByRole('heading', { name: /google api usage metrics/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/from:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/service name \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/metric name \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument();
    
    // Wait for initial data load
    await waitFor(() => expect(apiClient.getGoogleApiMetrics).toHaveBeenCalledTimes(1));
  });

  test('fetches and displays metrics on initial load', async () => {
    render(<ApiUsageMetricsPage />);
    await waitFor(() => expect(apiClient.getGoogleApiMetrics).toHaveBeenCalledTimes(1));
    
    // Check if chart is rendered (mocked)
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();

    // Check if raw data table headers are present
    expect(screen.getByText('Raw Data')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument(); // Table header
    expect(screen.getByText('Metric')).toBeInTheDocument(); // Table header
    
    // Check for some data points in the table
    expect(screen.getByText(mockMetricsData[0].service_name)).toBeInTheDocument();
    expect(screen.getByText(mockMetricsData[0].metric_name)).toBeInTheDocument();
    expect(screen.getByText(mockMetricsData[0].metric_value.toString())).toBeInTheDocument();
    expect(screen.getByText(`$${parseFloat(mockMetricsData[1].cost).toFixed(2)}`)).toBeInTheDocument();
  });

  test('allows changing filter values and re-fetches data on submit', async () => {
    render(<ApiUsageMetricsPage />);
    await waitFor(() => expect(apiClient.getGoogleApiMetrics).toHaveBeenCalledTimes(1)); // Initial fetch

    fireEvent.change(screen.getByLabelText(/from:/i), { target: { value: '2023-09-01' } });
    fireEvent.change(screen.getByLabelText(/service name \(optional\):/i), { target: { value: 'Specific Service' } });
    
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(screen.getByRole('button', { name: /loading.../i })).toBeDisabled();
    
    await waitFor(() => {
      expect(apiClient.getGoogleApiMetrics).toHaveBeenCalledTimes(2); // Second call for filter
      expect(apiClient.getGoogleApiMetrics).toHaveBeenCalledWith(expect.objectContaining({
        metric_date_after: '2023-09-01',
        service_name: 'Specific Service'
      }));
    });
  });

  test('handles API error during fetch and displays error message', async () => {
    const errorMessage = 'Failed to fetch metrics';
    apiClient.getGoogleApiMetrics.mockReset(); // Reset to change mock implementation for this test
    apiClient.getGoogleApiMetrics.mockRejectedValueOnce(new Error(errorMessage));

    render(<ApiUsageMetricsPage />);
    
    // Initial fetch will fail
    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
    // Ensure table and chart are not showing data
    expect(screen.queryByTestId('mock-line-chart')).not.toBeInTheDocument(); // Or check for "No data" message if chart wrapper is still there
    expect(screen.getByText(/no raw data available for the selected filters/i)).toBeInTheDocument();
  });
  
  test('displays "No data available" messages when API returns empty array', async () => {
    apiClient.getGoogleApiMetrics.mockReset();
    apiClient.getGoogleApiMetrics.mockResolvedValue([]); // Return empty array

    render(<ApiUsageMetricsPage />);
    await waitFor(() => expect(apiClient.getGoogleApiMetrics).toHaveBeenCalledTimes(1));

    expect(screen.getByText(/no data available for the selected filters to display in chart/i)).toBeInTheDocument();
    expect(screen.getByText(/no raw data available for the selected filters/i)).toBeInTheDocument();
  });

  // Note: Testing the actual chart rendering logic (e.g. correct data points on chart)
  // is complex with JSDOM and react-chartjs-2 mocks. 
  // The focus here is that the `Line` component receives data.
  // We can infer correct data processing by checking props if needed, but it's often omitted in basic tests.
  test('processes data correctly for the chart (conceptual check)', async () => {
    // This test relies on the mock Line component receiving props.
    // A more advanced test might spy on ChartJS.register or chart instance.
    render(<ApiUsageMetricsPage />);
    await waitFor(() => expect(apiClient.getGoogleApiMetrics).toHaveBeenCalledTimes(1));
    
    // Example: Check if the mocked chart component is present
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    
    // To truly test if chartData is processed correctly, you might need to:
    // 1. Not mock react-chartjs-2 and use a canvas mock.
    // 2. Or, if <Line data={chartData} options={chartOptions} />,
    //    you could try to access the props of the mocked Line component if the mock allows.
    //    However, the current simple mock `<canvas />` doesn't easily allow prop inspection.
    // For now, successful rendering of the mock chart and data table is a good indicator.
  });

});
