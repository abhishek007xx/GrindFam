import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout({ children, activeSection = 'dashboard' }) {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col">
      <Sidebar activeSection={activeSection} />
      <div className="lg:pl-[240px] flex flex-col flex-1 min-h-screen bg-[#0d1117]">
        <Navbar />
        <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
