import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SettingsModal from './SettingsModal';
import {
  LayoutDashboard, Building2, FileCode2, Map, Hash, Trophy, Users, UserPlus, Pencil,
  Activity, Settings, LogOut, Flame, Shield
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
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/dashboard?tab=leaderboard' },
  { id: 'friends', label: 'Friends', icon: Shield, path: '/dashboard?tab=friends' },
  { id: 'addFriend', label: 'Add Friend', icon: UserPlus, path: '/dashboard?tab=addFriend' },
];

const settingsNavItems = [
  { id: 'editTarget', label: 'Edit Target', icon: Pencil, path: null },
  { id: 'activity', label: 'Activity', icon: Activity, path: '/dashboard?scrollTo=activity-section' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ activeSection = null, onNavigate, onEditTarget, onOpenSquadModal, platformTotal = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user, signOut } = useAuth();
  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const initials = getInitials(name);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const level = Math.max(1, Math.floor(platformTotal / 10) + 1);
  const xpInLevel = (platformTotal % 10) * 50;
  const xpMax = 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpMax) * 100));

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
          // Strict route path detection to eliminate active state ambiguity
          const isActive = item.path
            ? (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path))
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
    <div className="flex flex-col h-full p-4 gap-2 bg-[#09090B] border-r border-[#27272A]">
      {/* 2. Logo Header (Clean & Aligned h-14 Header) */}
      <div
        className="px-2 h-14 flex items-center border-b border-[#27272A] cursor-pointer flex-shrink-0 mb-1"
        onClick={() => { onNavigate?.(); navigate('/'); }}
      >
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="GrindFam Logo" className="w-8 h-8 rounded-md object-cover border border-[#27272A] flex-shrink-0" />
          <h1 className="text-base font-bold text-white tracking-tight">
            Grind<span className="text-[#EA5D3A]">Fam</span>
          </h1>
        </div>
      </div>

      {/* 4. Nav Groups with Clean Hierarchy */}
      <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#27272A]">
        {renderNavGroup(mainNavItems, null)}
        {renderNavGroup(socialNavItems, 'SOCIAL')}
        {renderNavGroup(settingsNavItems, 'SETTINGS')}
      </nav>

      {/* 3 & 5. User Profile Card & XP Progress Bar */}
      <div className="p-3 bg-[#121212] border border-[#27272A] rounded-xl space-y-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-zinc-200 font-bold text-xs">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#121212]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#F4F4F5] truncate">{name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46] flex-shrink-0">
                You
              </span>
            </div>
            <p className="text-[10px] text-[#A1A1AA] flex items-center gap-1 mt-0.5">
              Level {level} Grinder <Flame className="w-3 h-3 text-amber-500 inline" />
            </p>
          </div>
        </div>

        {/* 5. XP Progress Bar */}
        <div>
          <div className="w-full bg-[#18181B] border border-[#27272A] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[9px] text-[#71717A] mt-1 font-mono">
            <span>XP Progress</span>
            <span>{xpInLevel} / {xpMax}</span>
          </div>
        </div>

        <button
          onClick={() => { onNavigate?.(); signOut(); }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-all border border-transparent hover:border-[#27272A]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
