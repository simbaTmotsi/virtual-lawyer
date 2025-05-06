import React from 'react';
import { NavLink } from 'react-router-dom';

const BillingNavigation = () => {
  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-2 sm:px-6 lg:px-8">
        <nav className="flex space-x-4">
          <NavLink
            to="/billing/time-entries"
            className={({ isActive }) =>
              isActive
                ? 'bg-primary-100 text-primary-700 px-3 py-2 rounded-md text-sm font-medium'
                : 'text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium'
            }
          >
            Time Entries
          </NavLink>
          <NavLink
            to="/billing/expenses"
            className={({ isActive }) =>
              isActive
                ? 'bg-primary-100 text-primary-700 px-3 py-2 rounded-md text-sm font-medium'
                : 'text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium'
            }
          >
            Expenses
          </NavLink>
          <NavLink
            to="/billing/invoices"
            className={({ isActive }) =>
              isActive
                ? 'bg-primary-100 text-primary-700 px-3 py-2 rounded-md text-sm font-medium'
                : 'text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium'
            }
          >
            Invoices
          </NavLink>
          <NavLink
            to="/billing/reports"
            className={({ isActive }) =>
              isActive
                ? 'bg-primary-100 text-primary-700 px-3 py-2 rounded-md text-sm font-medium'
                : 'text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium'
            }
          >
            Reports
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default BillingNavigation;
