import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Calendar, Bell, ChevronDown } from 'lucide-react';

const getInitials = (name = '') => {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const Navbar = ({ onRefresh, refreshing, platformTotal = 0 }) => {
  const { profile, user } = useAuth();
  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const initials = getInitials(name);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Streak is a visual indicator — show based on if user has any platform activity
  const streakDays = platformTotal > 0 ? Math.max(1, Math.floor(platformTotal / 3)) : 0;

  return (
    <header className="h-14 bg-[#0d1117] border-b border-[#21262d] flex items-center justify-between px-6 sticky top-0 z-30">
      <div></div>

      <div className="flex items-center gap-4">
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className={streakDays > 0 ? 'text-orange-400' : 'text-[#6e7681]'}>
            {streakDays > 0 ? `${streakDays} Day Streak` : 'No Streak Yet'}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-medium text-[#8b949e]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dateStr} (UTC)</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl hover:bg-white/5 text-[#8b949e] hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#21262d]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-[11px] border border-white/20">
            {initials}
          </div>
          <span className="text-sm font-medium text-[#e6edf3]">{name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8b949e]" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
