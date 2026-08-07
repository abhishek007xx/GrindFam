import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout({ children, activeSection = 'dashboard' }) {
  return (
    <div className="h-screen w-screen overflow-hidden overflow-x-hidden bg-[#0d1117] text-[#e6edf3] flex">
      {/* Sidebar (Desktop fixed 240px, Mobile drawer z-40) */}
      <Sidebar activeSection={activeSection} />

      {/* Main Content Area */}
      <div className="lg:pl-[240px] flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* Navbar (Header z-40) */}
        <Navbar />

        {/* Scrollable Page Content Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-[#0d1117]">
          {children}
        </main>
      </div>
    </div>
  );
}
