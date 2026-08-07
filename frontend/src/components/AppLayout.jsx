import React from 'react';
import MainLayout from './MainLayout';

export default function AppLayout({ children, activeSection = 'dashboard' }) {
  return <MainLayout activeSection={activeSection}>{children}</MainLayout>;
}
