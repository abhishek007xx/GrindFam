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

export default function Sidebar({ activeSection = 'dashboard', onNavigate, onEditTarget, onOpenSquadModal, platformTotal = 0 }) {
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
    <div className="mb-2">
      {label && (
        <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">{label}</p>
      )}
      {items.map((item) => {
        const isActive = (item.path && location.pathname === item.path) || activeSection === item.id;
        return (
          <div
            key={item.id}
            onClick={() => handleClick(item)}
            className={`flex items-center gap-3 px-3 py-2 text-xs font-medium cursor-pointer transition-all ${isActive
                ? 'bg-[#EA5D3A]/10 text-white border-l-2 border-[#EA5D3A] rounded-r-md'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-md'
              }`}
          >
            <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#EA5D3A]' : ''}`} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full p-4 gap-1 bg-[#09090B] border-r border-[#27272A]">
      {/* Logo */}
      <div className="px-2 h-12 flex items-center border-b border-[#27272A] cursor-pointer flex-shrink-0 mb-2" onClick={() => { onNavigate?.(); navigate('/'); }}>
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="GrindFam Logo" className="w-8 h-8 rounded-md object-cover border border-[#27272A] flex-shrink-0" />
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              Grind<span className="text-[#EA5D3A]">Fam</span>
            </h1>
            <p className="text-[9px] text-[#A1A1AA] font-medium leading-none">LeetCode Squad Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#27272A]">
        {renderNavGroup(mainNavItems, null)}
        {renderNavGroup(socialNavItems, 'Social')}
        {renderNavGroup(settingsNavItems, 'Settings')}
      </nav>

      {/* Bottom User Profile */}
      <div className="pt-3 border-t border-[#27272A] space-y-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#F4F4F5] truncate">{name}</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-medium bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46] flex-shrink-0">You</span>
            </div>
            <p className="text-[10px] text-[#A1A1AA] flex items-center gap-1">
              Level {level} Grinder <Flame className="w-3 h-3 text-amber-500 inline" />
            </p>
          </div>
        </div>

        {/* XP Bar — Emerald Green Fill #10B981 */}
        <div>
          <div className="progress-track h-1.5 bg-[#18181B] border border-[#27272A]">
            <div className="progress-fill h-full bg-[#10B981]" style={{ width: `${xpPercent}%` }}></div>
          </div>
          <p className="text-[9px] text-[#71717A] mt-1">XP {xpInLevel} / {xpMax}</p>
        </div>

        <button
          onClick={() => { onNavigate?.(); signOut(); }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/5 text-xs font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
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
