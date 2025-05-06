import React from 'react';
import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';

// This is a wrapper component that uses MainLayout but allows for dashboard-specific customization
const DashboardLayout = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default DashboardLayout;
