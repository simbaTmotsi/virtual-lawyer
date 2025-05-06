import React from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, PaperAirplaneIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatDate, getStatusClass } from '../../utils';

const Invoices = ({ invoices = [], handleStatusChange = () => {} }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="flex justify-between">
          <h2 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">Invoices</h2>
        </div>
        {!invoices || invoices.length === 0 ? (
          <p className="mt-4 text-gray-500 dark:text-gray-400">No invoices available.</p>
        ) : (
          <div className="mt-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issue Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400">
                      <Link to={`/billing/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {invoice.client_detail?.full_name || 'Unknown Client'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatDate(invoice.issue_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                      ${parseFloat(invoice.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                        {invoice.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/billing/invoices/${invoice.id}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(invoice.id, 'sent')}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Mark as Sent"
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                          </button>
                        )}
                        
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <button
                            onClick={() => handleStatusChange(invoice.id, 'paid')}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                            title="Mark as Paid"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                        )}
                        
                        {invoice.status !== 'void' && invoice.status !== 'paid' && (
                          <button
                            onClick={() => handleStatusChange(invoice.id, 'void')}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Void Invoice"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;