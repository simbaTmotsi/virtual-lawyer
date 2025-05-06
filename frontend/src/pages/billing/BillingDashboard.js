import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CurrencyDollarIcon, 
  ClockIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  ChartBarIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import apiRequest from '../../utils/api';

const BillingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingData, setBillingData] = useState({
    stats: [],
    clientSummary: [],
    recentInvoices: [],
    recentTimeEntries: []
  });

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        
        // Fetch client billing summary
        const clientSummary = await apiRequest('/api/billing/client-summary/');
        
        // Fetch recent invoices
        const recentInvoices = await apiRequest('/api/billing/invoices/?limit=5');
        
        // Fetch recent time entries
        const recentTimeEntries = await apiRequest('/api/billing/time-entries/?limit=5');
        
        // Calculate stats from the data
        const totalUnbilled = clientSummary.reduce((sum, client) => sum + client.unbilled_amount, 0);
        const totalOutstanding = clientSummary.reduce((sum, client) => sum + client.outstanding_invoices, 0);
        
        const stats = [
          {
            name: 'Unbilled Hours',
            value: clientSummary.reduce((sum, client) => sum + client.unbilled_hours, 0).toFixed(2),
            icon: ClockIcon,
            color: 'bg-blue-500',
            change: '+5.3%'
          },
          {
            name: 'Unbilled Amount',
            value: `$${totalUnbilled.toFixed(2)}`,
            icon: CurrencyDollarIcon,
            color: 'bg-green-500',
            change: '+12.1%'
          },
          {
            name: 'Outstanding Invoices',
            value: `$${totalOutstanding.toFixed(2)}`,
            icon: DocumentTextIcon,
            color: 'bg-amber-500',
            change: '-3.2%'
          },
          {
            name: 'Collected This Month',
            value: `$${(Math.random() * 20000).toFixed(2)}`, // Placeholder, replace with actual API data
            icon: ChartBarIcon,
            color: 'bg-violet-500',
            change: '+8.7%'
          }
        ];
        
        setBillingData({
          stats,
          clientSummary: clientSummary || [],
          recentInvoices: recentInvoices || [],
          recentTimeEntries: recentTimeEntries || []
        });
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch billing data:', err);
        setError('Failed to load billing data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Billing Dashboard</h2>
        <div className="flex space-x-3">
          <Link 
            to="/billing/time-entries/new" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
          >
            <ClockIcon className="h-4 w-4 mr-2" /> 
            Log Time
          </Link>
          <Link 
            to="/billing/invoices/new" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
          >
            <DocumentPlusIcon className="h-4 w-4 mr-2" /> 
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {billingData.stats.map(stat => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.name}</dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</dd>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-2">
              <div className="flex items-center">
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
                  {stat.change} from last month
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client Billing Summary */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Client Billing Summary</h3>
          <button 
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            onClick={() => window.location.reload()}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unbilled Hours</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unbilled Amount</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Outstanding Invoices</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {billingData.clientSummary.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No billing data available
                  </td>
                </tr>
              ) : (
                billingData.clientSummary.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                      {client.unbilled_hours.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                      ${client.unbilled_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                      ${client.outstanding_invoices.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                      <Link 
                        to={`/billing/invoices/new?client=${client.id}`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
                      >
                        Create Invoice
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Invoices</h3>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {billingData.recentInvoices.length === 0 ? (
                <li className="py-4 text-center text-gray-500 dark:text-gray-400">No recent invoices</li>
              ) : (
                billingData.recentInvoices.map(invoice => (
                  <li key={invoice.id} className="py-4">
                    <Link to={`/billing/invoices/${invoice.id}`} className="flex justify-between hover:bg-gray-50 dark:hover:bg-gray-700 -mx-4 px-4 py-2 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.client_detail?.full_name || 'Unknown Client'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">${invoice.total_amount}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {invoice.status_display}
                          </span>
                        </p>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-4 text-center">
              <Link to="/billing/invoices" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
                View All Invoices
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Time Entries */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Time Entries</h3>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {billingData.recentTimeEntries.length === 0 ? (
                <li className="py-4 text-center text-gray-500 dark:text-gray-400">No recent time entries</li>
              ) : (
                billingData.recentTimeEntries.map(entry => (
                  <li key={entry.id} className="py-4">
                    <div className="flex justify-between hover:bg-gray-50 dark:hover:bg-gray-700 -mx-4 px-4 py-2 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.case_detail?.title || 'Unknown Case'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.hours} hours</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">${entry.amount}</p>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-4 text-center">
              <Link to="/billing/time-entries" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
                View All Time Entries
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
