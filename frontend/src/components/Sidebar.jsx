import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SettingsModal from './SettingsModal';
import {
  LayoutDashboard, Building2, FileCode2, Map, Hash, Trophy, Users, UserPlus, Pencil,
  Activity, Settings, Flame, Shield, Sun, Moon
} from 'lucide-react';

const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'companies', label: 'Company Tracks', icon: Building2, path: '/companies' },
  { id: 'sheets', label: 'DSA Sheets', icon: FileCode2, path: '/sheets' },
  { id: 'roadmaps', label: 'Roadmaps', icon: Map, path: '/roadmaps' },
  { id: 'topics', label: 'Topics', icon: Hash, path: '/topics/Array' },
];

const socialNavItems = [
  { id: 'community', label: 'Community', icon: Users, path: '/community' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/?tab=leaderboard' },
  { id: 'friends', label: 'Friends', icon: Shield, path: '/?tab=friends' },
  { id: 'addFriend', label: 'Add Friend', icon: UserPlus, path: '/?tab=addFriend' },
];

const settingsNavItems = [
  { id: 'editTarget', label: 'Edit Target', icon: Pencil, path: null },
  { id: 'activity', label: 'Activity', icon: Activity, path: '/dashboard?scrollTo=activity-section' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ activeSection = null, onNavigate, onEditTarget, onOpenSquadModal, platformTotal = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const level = Math.max(1, Math.floor(platformTotal / 10) + 1);
  const xpInLevel = (platformTotal % 10) * 50;
  const xpMax = 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpMax) * 100));

  const currentTab = new URLSearchParams(location.search).get('tab');

  const handleClick = (item) => {
    onNavigate?.();
    if (item.id === 'settings') {
      navigate('/settings');
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

    if (item.path) {
      navigate(item.path);
    }
  };

  const renderNavGroup = (items, label) => (
    <div className="mb-3">
      {label && (
        <p className="px-3 py-1.5 text-[11px] font-medium tracking-wider text-zinc-500 uppercase">{label}</p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          // Precise active route & query param tab matching
          const isActive = item.path
            ? (item.path.includes('?tab=')
                ? (location.pathname === '/' || location.pathname === '/dashboard') && currentTab === new URLSearchParams(item.path.split('?')[1]).get('tab')
                : (item.path === '/' ? (location.pathname === '/' || location.pathname === '/dashboard') && !currentTab : location.pathname.startsWith(item.path)))
            : activeSection === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#18181B] text-white border-l-2 border-[#EA5D3A] rounded-r-md font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181B]/50 rounded-md'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#EA5D3A]' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full px-4 py-3 gap-2 bg-[#0B0C10] border-r border-[#27272A]">
      {/* Logo Header */}
      <div
        className="px-2 h-16 flex items-center border-b border-[#27272A] cursor-pointer flex-shrink-0 mb-1"
        onClick={() => { onNavigate?.(); navigate('/'); }}
      >
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="GrindFam Logo" className="w-8 h-8 rounded-md object-cover border border-[#27272A] flex-shrink-0" />
          <h1 className="text-base font-bold text-white tracking-tight">
            Grind<span className="text-[#EA5D3A]">Fam</span>
          </h1>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#27272A]">
        {renderNavGroup(mainNavItems, null)}
        {renderNavGroup(socialNavItems, 'SOCIAL')}
        {renderNavGroup(settingsNavItems, 'SETTINGS')}
      </nav>

      {/* Level / XP Progress Widget */}
      <div className="p-3 bg-[#121212] border border-[#27272A] rounded-xl space-y-2.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
            Level {level} Grinder
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div>
          <div className="w-full bg-[#18181B] border border-[#27272A] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[9px] text-zinc-500 mt-1 font-mono">
            <span>XP Progress</span>
            <span>{xpInLevel} / {xpMax}</span>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
