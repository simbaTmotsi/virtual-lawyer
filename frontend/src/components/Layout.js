import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
// Import other layout components as needed

function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
