import React from 'react';
import { Link } from 'react-router-dom';
import { CurrencyDollarIcon, ClockIcon, DocumentIcon, ChartBarIcon } from '@heroicons/react/outline'; // Assuming you're using Heroicons

const Sidebar = () => {
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: null,
    },
    {
      name: 'Cases',
      href: '/cases',
      icon: null,
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: CurrencyDollarIcon,
      children: [
        { name: 'Dashboard', href: '/billing' },
        { name: 'Time Entries', href: '/billing/time-entries' },
        { name: 'Invoices', href: '/billing/invoices' },
        { name: 'Reports', href: '/billing/reports' },
      ],
    },
  ];

  return (
    <nav className="sidebar">
      <ul>
        {navigation.map((item) => (
          <li key={item.name}>
            <Link to={item.href}>
              {item.icon && <item.icon className="icon" />}
              {item.name}
            </Link>
            {item.children && (
              <ul>
                {item.children.map((child) => (
                  <li key={child.name}>
                    <Link to={child.href}>{child.name}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;