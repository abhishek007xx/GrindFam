import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout({ children, onRefresh, refreshing, platformTotal = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('grindfam_sidebar_collapsed') === 'true';
    } catch (_) {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('grindfam_sidebar_collapsed', next.toString());
      } catch (_) {}
      return next;
    });
  };

  return (
    <div className="h-screen w-full flex bg-[#0B0C10] dark:bg-[#0B0C10] light:bg-slate-50 text-zinc-200 dark:text-zinc-200 light:text-slate-900 overflow-hidden">
      {/* Desktop Collapsible Sidebar Container */}
      <div className={`hidden lg:block ${isCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 border-r border-[#27272A] dark:border-[#27272A] light:border-slate-200 overflow-y-auto bg-[#0B0C10] dark:bg-[#0B0C10] light:bg-white transition-all duration-300 ease-in-out`}>
        <Sidebar
          platformTotal={platformTotal}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-[#0B0C10] dark:bg-[#0B0C10] light:bg-white border-r border-[#27272A] dark:border-[#27272A] light:border-slate-200 overflow-y-auto">
            <Sidebar
              onNavigate={() => setMobileOpen(false)}
              platformTotal={platformTotal}
              isCollapsed={false}
            />
          </div>
        </div>
      )}

      {/* Main Page Area — Dynamic fill */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        <Navbar onToggleSidebar={() => setMobileOpen(o => !o)} onRefresh={onRefresh} refreshing={refreshing} platformTotal={platformTotal} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full max-w-full p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
