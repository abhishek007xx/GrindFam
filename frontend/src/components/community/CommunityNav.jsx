import React from 'react';
import { Flame, Swords, Users, Sparkles } from 'lucide-react';

export function CommunityNav({ activeMode, onSelectMode, streakCount = 14, isShieldActive = true }) {
  const modes = [
    { id: 'today', label: 'Today & Habits', icon: Sparkles, badge: null },
    { id: 'arena', label: 'Battle Arena', icon: Swords, badge: 'LIVE 1v1' },
    { id: 'squad', label: 'Squad & Peer Hub', icon: Users, badge: null }
  ];

  return (
    <nav aria-label="Community Mode Navigation" className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#161B22] border border-[#30363D] rounded-xl p-3 shadow-md">
      {/* 3 Spatial Mode Tabs */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#1F2937] text-white border border-[#EA5D3A] shadow-sm shadow-[#EA5D3A]/10'
                  : 'bg-transparent text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#EA5D3A]' : 'text-[#6B7280]'}`} />
              <span>{mode.label}</span>
              {mode.badge && (
                <span className="px-1.5 py-0.5 rounded bg-[#EA5D3A]/20 text-[#EA5D3A] text-[9px] font-extrabold uppercase border border-[#EA5D3A]/30">
                  {mode.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Persistent Streak & Habit Counter Status Pill */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 border-[#21262D] pt-2 sm:pt-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] text-xs font-bold shadow-sm">
          <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
          <span>{streakCount} Day Streak</span>
        </div>

        {isShieldActive && (
          <span className="px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[11px] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Shield Active
          </span>
        )}
      </div>
    </nav>
  );
}

export default CommunityNav;
