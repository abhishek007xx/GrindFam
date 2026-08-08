import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import EditTargetModal from './EditTargetModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MainLayout({ children, onRefresh, refreshing, platformTotal = 0 }) {
  const [isEditTargetOpen, setIsEditTargetOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('grindfam_sidebar_collapsed') === 'true';
    } catch (_) {
      return false;
    }
  });

  const location = useLocation();

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('grindfam_sidebar_collapsed', next.toString());
      } catch (_) {}
      return next;
    });
  };

  // Automatically collapse sidebar on Community section for max screen area (as requested)
  useEffect(() => {
    if (location.pathname === '/community' || location.pathname.startsWith('/community')) {
      setIsCollapsed(true);
    }
  }, [location.pathname]);

  const isCommunityPage = location.pathname.startsWith('/community');

  return (
    <div className="h-screen w-full flex bg-[#141414] dark:bg-[#141414] light:bg-slate-50 text-zinc-200 dark:text-zinc-200 light:text-slate-900 overflow-hidden">
      {/* Desktop Collapsible Sidebar Container */}
      <div className={`relative hidden lg:block ${isCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 border-r border-[#333333] dark:border-[#333333] light:border-slate-200 bg-[#141414] dark:bg-[#141414] light:bg-white transition-all duration-300 ease-in-out z-20`}>
        {/* Sleek Floating Collapse Toggle Button on Border Line */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-5 z-40 w-6 h-6 rounded-full bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-300 text-[#EA5D3A] hover:bg-[#EA5D3A] hover:text-white transition-all shadow-md flex items-center justify-center cursor-pointer group"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          )}
        </button>

        <div className="h-full overflow-y-auto">
          <Sidebar
            platformTotal={platformTotal}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
            onEditTarget={() => setIsEditTargetOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-[#141414] dark:bg-[#141414] light:bg-white border-r border-[#333333] dark:border-[#333333] light:border-slate-200 overflow-y-auto">
            <Sidebar
              onNavigate={() => setMobileOpen(false)}
              platformTotal={platformTotal}
              isCollapsed={false}
              onEditTarget={() => {
                setMobileOpen(false);
                setIsEditTargetOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Page Area — Dynamic fill */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        {!isCommunityPage && (
          <Navbar
            onToggleSidebar={() => setMobileOpen(o => !o)}
            onToggleCollapse={toggleCollapse}
            isCollapsed={isCollapsed}
            onRefresh={onRefresh}
            refreshing={refreshing}
            platformTotal={platformTotal}
          />
        )}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className={isCommunityPage ? "w-full min-h-full" : "max-w-7xl mx-auto w-full max-w-full p-4 md:p-6 lg:p-8"}>{children}</div>
        </main>
      </div>

      <EditTargetModal
        isOpen={isEditTargetOpen}
        currentTarget={parseInt(localStorage.getItem('grindfam_daily_target') || '5', 10)}
        onClose={() => setIsEditTargetOpen(false)}
        onSave={async (newTarget) => {
          localStorage.setItem('grindfam_daily_target', newTarget.toString());
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
