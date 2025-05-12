import React from 'react';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = ({ children }) => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar showAdminLink={isAdmin} />
      <div className="md:pl-64 flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
