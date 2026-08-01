import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Trophy, Users, UserPlus, Pencil,
  Activity, Settings, LogOut, Flame, Shield
} from 'lucide-react';

const getInitials = (name = '') => {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, scrollTo: null },
  { id: 'squadOptions', label: 'Squad Options', icon: Shield, scrollTo: null },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, scrollTo: 'leaderboard-section' },
  { id: 'friends', label: 'Friends', icon: Users, scrollTo: 'leaderboard-section' },
  { id: 'addFriend', label: 'Add Friend', icon: UserPlus, scrollTo: 'add-friend-section' },
  { id: 'editTarget', label: 'Edit Target', icon: Pencil, scrollTo: null },
  { id: 'activity', label: 'Activity', icon: Activity, scrollTo: 'activity-section' },
  { id: 'settings', label: 'Settings', icon: Settings, scrollTo: null },
];

const Sidebar = ({ activeSection = 'dashboard', onNavigate, onEditTarget, onOpenSquadModal, platformTotal = 0 }) => {
  const { profile, user, signOut } = useAuth();
  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const initials = getInitials(name);

  // Dynamic level & XP from platformTotal
  const level = Math.max(1, Math.floor(platformTotal / 10) + 1);
  const xpInLevel = (platformTotal % 10) * 50; // each problem = 50 XP
  const xpMax = 500; // 10 problems per level × 50 XP
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpMax) * 100));

  const handleClick = (id) => {
    if (id === 'editTarget') {
      onEditTarget?.();
      return;
    }
    if (id === 'squadOptions') {
      onOpenSquadModal?.();
      return;
    }

    onNavigate?.(id);

    const item = navItems.find((n) => n.id === id);
    if (item?.scrollTo) {
      const el = document.getElementById(item.scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (id === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#0d1117] border-r border-[#21262d] flex flex-col z-40 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#21262d]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center">
            <span className="text-[#22c55e] font-black text-sm">&lt;&gt;</span>
          </div>
          <div>
            <h1 className="text-[15px] font-extrabold text-white leading-tight">
              Grind<span className="text-[#22c55e]">Fam</span>
            </h1>
            <p className="text-[10px] text-[#8b949e] font-medium">LeetCode Squad Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div className="px-4 pb-4 border-t border-[#21262d] pt-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs border border-white/20 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white truncate">{name}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">You</span>
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
    </aside>
  );
};

export default Sidebar;
