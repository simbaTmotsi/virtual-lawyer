import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Placeholder for Admin Header/Sidebar */}
      <header className="bg-primary-600 shadow text-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Admin page content goes here */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
