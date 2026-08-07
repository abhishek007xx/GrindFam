import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout({ children, onRefresh, refreshing, platformTotal = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="h-screen w-full flex bg-[#0B0C10] text-zinc-200 overflow-hidden">
      <div className="hidden lg:block w-64 flex-shrink-0 border-r border-[#27272A] overflow-y-auto bg-[#0B0C10]">
        <Sidebar platformTotal={platformTotal} />
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-[#0B0C10] border-r border-[#27272A] overflow-y-auto">
            <Sidebar onNavigate={() => setMobileOpen(false)} platformTotal={platformTotal} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setMobileOpen(o => !o)} onRefresh={onRefresh} refreshing={refreshing} platformTotal={platformTotal} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full max-w-full p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
