import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SettingsModal from './SettingsModal';
import {
  LayoutDashboard, Building2, FileCode2, Map, Hash, Trophy, Users, UserPlus, Pencil,
  Activity, Settings, Flame, Shield, Sun, Moon, PanelLeftClose, PanelLeftOpen
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

export default function Sidebar({
  activeSection = null,
  onNavigate,
  onEditTarget,
  onOpenSquadModal,
  platformTotal = 0,
  isCollapsed = false,
  onToggleCollapse
}) {
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
      {label && !isCollapsed && (
        <p className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-500 light:text-slate-600 uppercase transition-opacity duration-200">{label}</p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = item.path
            ? (item.path.includes('?tab=')
                ? (location.pathname === '/' || location.pathname === '/dashboard') && currentTab === new URLSearchParams(item.path.split('?')[1]).get('tab')
                : (item.path === '/' ? (location.pathname === '/' || location.pathname === '/dashboard') && !currentTab : location.pathname.startsWith(item.path)))
            : activeSection === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium cursor-pointer transition-all ${
                isCollapsed ? 'justify-center px-2' : ''
              } ${
                isActive
                  ? 'bg-[#18181B] dark:bg-[#18181B] light:bg-slate-100 text-white dark:text-white light:text-slate-900 border-l-2 border-[#EA5D3A] rounded-r-md font-semibold'
                  : 'text-zinc-400 dark:text-zinc-400 light:text-slate-700 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-slate-900 hover:bg-[#18181B]/50 dark:hover:bg-[#18181B]/50 light:hover:bg-slate-100 rounded-md'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#EA5D3A]' : 'text-zinc-400 dark:text-zinc-400 light:text-slate-500'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-full py-3 gap-2 bg-[#0B0C10] dark:bg-[#0B0C10] light:bg-white border-r border-[#27272A] dark:border-[#27272A] light:border-slate-200 transition-all duration-300 ${
      isCollapsed ? 'px-2' : 'px-4'
    }`}>
      {/* Logo Header */}
      <div
        className={`h-16 flex items-center justify-between border-b border-[#27272A] dark:border-[#27272A] light:border-slate-200 flex-shrink-0 mb-1 ${
          isCollapsed ? 'justify-center px-1' : 'px-2'
        }`}
      >
        <div
          className="flex items-center gap-2.5 cursor-pointer min-w-0"
          onClick={() => { onNavigate?.(); navigate('/'); }}
          title={isCollapsed ? "GrindFam Home" : undefined}
        >
          <img src="/logo.png" alt="GrindFam Logo" className="w-8 h-8 rounded-md object-cover border border-[#27272A] dark:border-[#27272A] light:border-slate-200 flex-shrink-0" />
          {!isCollapsed && (
            <h1 className="text-base font-bold text-white dark:text-white light:text-slate-900 tracking-tight truncate">
              Grind<span className="text-[#EA5D3A]">Fam</span>
            </h1>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
            className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 transition-colors flex-shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-[#EA5D3A]" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#27272A]">
        {renderNavGroup(mainNavItems, null)}
        {renderNavGroup(socialNavItems, 'SOCIAL')}
        {renderNavGroup(settingsNavItems, 'SETTINGS')}
      </nav>

      {/* Level / XP Progress Widget */}
      {isCollapsed ? (
        <div
          className="p-2 bg-[#121212] dark:bg-[#121212] light:bg-slate-100/90 border border-[#27272A] dark:border-[#27272A] light:border-slate-200 rounded-xl flex flex-col items-center gap-2 flex-shrink-0 shadow-sm"
          title={`Level ${level} Grinder (${xpInLevel}/${xpMax} XP)`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#EA5D3A]/15 text-[#EA5D3A] border border-[#EA5D3A]/30 flex items-center justify-center font-bold text-xs">
            L{level}
          </div>
          <button
            onClick={toggleTheme}
            className="p-1 rounded text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-amber-400 hover:bg-white/5 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
          </button>
        </div>
      ) : (
        <div className="p-3 bg-[#121212] dark:bg-[#121212] light:bg-slate-100/90 border border-[#27272A] dark:border-[#27272A] light:border-slate-200 rounded-xl space-y-2.5 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-100 dark:text-zinc-100 light:text-slate-900 flex items-center gap-1.5">
              Level {level} Grinder
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-1 rounded text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-amber-400 hover:bg-white/5 transition-colors"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-1 rounded text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/5 transition-colors"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="w-full bg-[#18181B] dark:bg-[#18181B] light:bg-slate-200 border border-[#27272A] dark:border-[#27272A] light:border-slate-300 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-[9px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 mt-1 font-mono">
              <span>XP Progress</span>
              <span>{xpInLevel} / {xpMax}</span>
            </div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
