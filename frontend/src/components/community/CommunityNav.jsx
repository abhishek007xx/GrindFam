import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Swords, Users, Sparkles, ShieldCheck, Bell } from 'lucide-react';

export function CommunityNav({ activeMode, onSelectMode, streakCount = 0, isShieldActive = false, pendingReviewCount = 0 }) {
  const modes = [
    { id: 'today', label: 'Today & Habits', icon: Sparkles, badge: null, ariaControl: 'today-panel' },
    { id: 'arena', label: 'Battle Arena', icon: Swords, badge: 'LIVE 1v1', ariaControl: 'arena-panel' },
    { id: 'squad', label: 'Squad & Peer Hub', icon: Users, badge: pendingReviewCount > 0 ? `${pendingReviewCount}` : null, ariaControl: 'squad-panel' }
  ];

  // Streak urgency: pulse when streak might expire soon
  const streakUrgent = streakCount > 0;

  return (
    <nav
      aria-label="Grind Hub Primary Navigation"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121215] border border-[#27272A] rounded-xl p-2.5 shadow-md relative"
    >
      {/* 3 Spatial Mode Tabs with Linear-style Animated Pill Indicator */}
      <div
        role="tablist"
        aria-label="Grind Hub Modes"
        className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none p-0.5"
      >
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              role="tab"
              id={`tab-${mode.id}`}
              aria-selected={isActive}
              aria-controls={mode.ariaControl}
              onClick={() => onSelectMode(mode.id)}
              className={`relative px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121215] ${
                isActive ? 'text-white font-extrabold' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {/* Animated Tab Background Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeCommunityTabIndicator"
                  className="absolute inset-0 bg-[#18181B] border border-[#EA5D3A]/60 rounded-lg shadow-sm shadow-[#EA5D3A]/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-2">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#EA5D3A]' : 'text-[#6B7280]'}`} />
                <span>{mode.label}</span>
                {mode.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                    mode.id === 'squad'
                      ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'
                      : 'bg-[#EA5D3A]/20 text-[#EA5D3A] border-[#EA5D3A]/30'
                  }`}>
                    {mode.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Persistent Streak & Habit Counter Status Pill */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 border-[#222225] pt-2 sm:pt-0">
        <div
          aria-label={`Current Daily Streak: ${streakCount} days`}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm transition-all ${
            streakCount > 0
              ? 'bg-[#EA5D3A]/15 border-[#EA5D3A]/30 text-[#EA5D3A]'
              : 'bg-[#18181B] border-[#27272A] text-[#6B7280]'
          }`}
        >
          <Flame
            className={`w-3.5 h-3.5 ${streakCount > 0 ? 'fill-current' : ''} ${streakUrgent ? 'animate-pulse' : ''}`}
            aria-hidden="true"
          />
          <span>{streakCount > 0 ? `${streakCount} Day Streak` : 'No Active Streak'}</span>
        </div>

        {isShieldActive && (
          <div
            aria-label="Streak Freeze Protection Shield Active"
            className="px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[11px] font-semibold flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Shield Active</span>
          </div>
        )}
      </div>
    </nav>
  );
}

export default CommunityNav;
