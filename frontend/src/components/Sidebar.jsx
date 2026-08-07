import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SettingsModal from './SettingsModal';
import {
  LayoutDashboard, Building2, FileCode2, Map, Hash, Trophy, Users, UserPlus, Pencil,
  Activity, Settings, LogOut, Flame, Shield, Menu, X
} from 'lucide-react';

const getInitials = (name = '') => {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'companies', label: 'Company Tracks', icon: Building2, path: '/companies' },
  { id: 'sheets', label: 'DSA Sheets', icon: FileCode2, path: '/sheets' },
  { id: 'roadmaps', label: 'Roadmaps', icon: Map, path: '/roadmaps' },
  { id: 'topics', label: 'Topics', icon: Hash, path: '/topics/Array' },
];

const socialNavItems = [
  { id: 'community', label: 'Community', icon: Users, path: '/community' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/', scrollTo: 'leaderboard-section' },
  { id: 'friends', label: 'Friends', icon: Shield, path: '/', scrollTo: 'leaderboard-section' },
  { id: 'addFriend', label: 'Add Friend', icon: UserPlus, path: '/', scrollTo: 'add-friend-section' },
];

const settingsNavItems = [
  { id: 'editTarget', label: 'Edit Target', icon: Pencil, path: null },
  { id: 'activity', label: 'Activity', icon: Activity, path: '/', scrollTo: 'activity-section' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = ({ activeSection = 'dashboard', onNavigate, onEditTarget, onOpenSquadModal, platformTotal = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user, signOut } = useAuth();
  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const initials = getInitials(name);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dynamic level & XP from platformTotal
  const level = Math.max(1, Math.floor(platformTotal / 10) + 1);
  const xpInLevel = (platformTotal % 10) * 50;
  const xpMax = 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpMax) * 100));

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleClick = (item) => {
    if (item.id === 'settings') {
      navigate('/settings');
      setMobileOpen(false);
      return;
    }
    if (item.id === 'editTarget') {
      onEditTarget?.();
      return;
    }
    if (item.id === 'squadOptions') {
      onOpenSquadModal?.();
      return;
    }

    if (item.path && item.path !== window.location.pathname) {
      navigate(item.path);
    } else {
      onNavigate?.(item.id);
    }

    if (item.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(item.scrollTo);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (item.id === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setMobileOpen(false);
  };

  const renderNavGroup = (items, label) => (
    <div className="mb-2">
      {label && (
        <p className="px-4 pt-4 pb-2 text-[9px] font-bold text-[#484f58] uppercase tracking-[0.15em]">{label}</p>
      )}
      {items.map((item) => {
        const isActive = (item.path && location.pathname === item.path) || activeSection === item.id;
        return (
          <div
            key={item.id}
            onClick={() => handleClick(item)}
            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 h-14 flex items-center border-b border-[#21262d] cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[#22c55e] font-black text-sm">&lt;&gt;</span>
          </div>
          <div>
            <h1 className="text-[15px] font-extrabold text-white leading-tight">
              Grind<span className="text-[#22c55e]">Fam</span>
            </h1>
            <p className="text-[10px] text-[#8b949e] font-medium leading-none">LeetCode Squad Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 pt-4 pb-2 overflow-y-auto">
        {renderNavGroup(mainNavItems, null)}
        {renderNavGroup(socialNavItems, 'Social')}
        {renderNavGroup(settingsNavItems, 'Settings')}
      </nav>

      {/* Bottom User Profile */}
      <div className="px-4 pb-4 border-t border-[#21262d] pt-4 space-y-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs border border-white/20 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white truncate">{name}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 flex-shrink-0">You</span>
            </div>
            <p className="text-[10px] text-[#8b949e] flex items-center gap-1">
              Level {level} Grinder <Flame className="w-3 h-3 text-amber-500 inline" />
            </p>
          </div>
        </div>

        {/* XP Bar */}
        <div>
          <div className="progress-track h-1.5">
            <div className="progress-fill" style={{ width: `${xpPercent}%` }}></div>
          </div>
          <p className="text-[10px] text-[#8b949e] mt-1">XP {xpInLevel} / {xpMax}</p>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#8b949e] hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-xl bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-all"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay lg:hidden ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[240px] bg-[#0d1117] border-r border-[#21262d] flex-col z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-[#0d1117] border-r border-[#21262d] flex flex-col z-40 transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors z-10"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Settings / Password Reset Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default Sidebar;
