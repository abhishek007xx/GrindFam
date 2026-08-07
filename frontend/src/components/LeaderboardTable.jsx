import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Flame, CheckCircle2, AlertCircle, ArrowRight, Calendar, Globe,
  Zap, Crown, Award, Shield, Sparkles, UserX, Send
} from 'lucide-react';

const avatarColors = [
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
  'from-rose-500 to-red-600',
];

const getAvatarGradient = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const getInitials = (name = '') => {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const LeaderboardTable = ({
  leaderboard = [],
  dailyTarget = 5,
  onRemoveFriend,
  removingId
}) => {
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'allTime' | 'streak'
  const [nudgedUser, setNudgedUser] = useState(null);

  // Sort leaderboard based on viewMode
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (viewMode === 'allTime') {
      const totalA = a.platformTotal || 0;
      const totalB = b.platformTotal || 0;
      if (totalB !== totalA) return totalB - totalA;
      return (b.todayCount || 0) - (a.todayCount || 0);
    }
    if (viewMode === 'streak') {
      const streakA = a.streak || 0;
      const streakB = b.streak || 0;
      if (streakB !== streakA) return streakB - streakA;
      return (b.todayCount || 0) - (a.todayCount || 0);
    }
    // Default 'today'
    if ((b.todayCount || 0) !== (a.todayCount || 0)) {
      return (b.todayCount || 0) - (a.todayCount || 0);
    }
    return (b.platformTotal || 0) - (a.platformTotal || 0);
  }).map((item, idx) => ({ ...item, displayRank: idx + 1 }));

  const topThree = sortedLeaderboard.slice(0, 3);

  const handleNudge = (user) => {
    setNudgedUser(user.name || user.leetcodeUsername || 'Squad Mate');
    setTimeout(() => setNudgedUser(null), 3000);
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#EA5D3A]/20 text-[#EA5D3A] font-bold text-xs border border-[#EA5D3A]/30">
          #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-300/20 text-slate-200 font-bold text-xs border border-slate-300/40">
          #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-700/30 text-amber-300 font-bold text-xs border border-amber-600/40">
          #3
        </span>
      );
    }
    return <span className="text-xs font-semibold text-[#9CA3AF] ml-2">#{rank}</span>;
  };

  const getStatusBadge = (user) => {
    if (user.error) {
      return (
        <span className="text-xs text-red-400 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Error
        </span>
      );
    }
    const isOverachieved = user.todayCount > dailyTarget;
    const isTargetHit = user.todayCount >= dailyTarget;

    if (isOverachieved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold whitespace-nowrap shadow-sm">
          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" /> +{user.todayCount - dailyTarget} Extra
        </span>
      );
    }
    if (isTargetHit) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EA5D3A]/15 text-[#EA5D3A] border border-[#EA5D3A]/30 text-[10px] font-bold whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3" /> Target Met
        </span>
      );
    }
    return (
      <button
        onClick={() => handleNudge(user)}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30 text-[10px] font-bold whitespace-nowrap transition-all active:scale-95"
      >
        <Zap className="w-3 h-3 text-purple-400 fill-purple-400" /> Nudge
      </button>
    );
  };

  return (
    <div className="dash-card overflow-hidden relative">
      {/* Toast Notification for Nudge */}
      <AnimatePresence>
        {nudgedUser && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-purple-600/90 border border-purple-400/50 text-white text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white text-white animate-bounce" />
            <span>Nudge sent to {nudgedUser}! Keep grinding!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with View Mode Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[16px] font-extrabold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
              Squad Leaderboard
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EA5D3A]/15 text-[#EA5D3A] border border-[#EA5D3A]/30">
                Live
              </span>
            </h2>
            <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">Compete with friends to hit 5 a day</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-[#141414] dark:bg-[#141414] light:bg-slate-100 p-1 rounded-xl border border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200 self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setViewMode('today')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'today'
                ? 'bg-[#EA5D3A] text-white shadow-md'
                : 'text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>

          <button
            onClick={() => setViewMode('streak')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'streak'
                ? 'bg-[#EA5D3A] text-white shadow-md'
                : 'text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Streaks</span>
          </button>

          <button
            onClick={() => setViewMode('allTime')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'allTime'
                ? 'bg-[#EA5D3A] text-white shadow-md'
                : 'text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All-Time</span>
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[50px_1fr_80px_100px] sm:grid-cols-[50px_1fr_90px_1fr_90px_110px] items-center px-4 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-[#737373] dark:text-[#737373] light:text-slate-500 uppercase tracking-wider border-b border-[#2C2C2C]/60 dark:border-[#2C2C2C]/60 light:border-slate-200 bg-[#141414]/30 dark:bg-[#141414]/30 light:bg-slate-50">
        <span>Rank</span>
        <span>Squad Member</span>
        <span className={`text-center ${viewMode === 'today' ? 'text-[#EA5D3A]' : ''}`}>Today</span>
        <span className="hidden sm:block text-center">Daily Progress</span>
        <span className={`hidden sm:block text-center ${viewMode === 'allTime' ? 'text-[#EA5D3A]' : ''}`}>All-Time</span>
        <span className="text-center">Action</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#2C2C2C]/50 dark:divide-[#2C2C2C]/50 light:divide-slate-200">
        {sortedLeaderboard.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#737373]">
            No grinders in your squad yet. Click "Add Friend" below to build your squad!
          </div>
        ) : (
          sortedLeaderboard.map((user) => {
            const progressPercent = Math.min(140, Math.round((user.todayCount / dailyTarget) * 100));
            const barWidth = Math.min(100, progressPercent);
            const isOverachieved = user.todayCount > dailyTarget;
            const isTargetHit = user.todayCount >= dailyTarget;
            const gradient = getAvatarGradient(user.name || user.id);
            const initials = getInitials(user.name);

            let rowBg = 'hover:bg-white/[0.02]';
            if (user.displayRank === 1) rowBg = 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]';
            else if (user.isSelf) rowBg = 'bg-[#EA5D3A]/[0.03] hover:bg-[#EA5D3A]/[0.06]';

            return (
              <div
                key={user.id}
                className={`grid grid-cols-[50px_1fr_80px_100px] sm:grid-cols-[50px_1fr_90px_1fr_90px_110px] items-center px-4 sm:px-5 py-3 sm:py-3.5 transition-colors ${rowBg}`}
              >
                {/* Rank */}
                <div>{getRankDisplay(user.displayRank)}</div>

                {/* Member */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-[10px] sm:text-[11px] border border-white/15 flex-shrink-0 shadow-sm`}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-white dark:text-white light:text-slate-900 truncate">{user.name}</span>
                      {user.isSelf && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold bg-[#EA5D3A]/15 text-[#EA5D3A] border border-[#EA5D3A]/30 flex-shrink-0">You</span>
                      )}
                      {user.badge && (
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {user.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500 truncate">@{user.leetcodeUsername || 'leetcode'}</p>
                  </div>
                </div>

                {/* Today's Solved */}
                <div className="text-center">
                  <span className={`text-sm font-black font-mono ${viewMode === 'today' ? 'text-[#EA5D3A]' : 'text-white dark:text-white light:text-slate-900'}`}>
                    {user.todayCount}
                  </span>
                </div>

                {/* Progress Bar — hidden on mobile */}
                <div className="hidden sm:block px-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold font-mono min-w-[36px] ${isTargetHit ? 'text-[#EA5D3A]' : 'text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500'}`}>
                      {progressPercent}%
                    </span>
                    <div className="flex-1 progress-track h-2 bg-zinc-800 dark:bg-zinc-800 light:bg-slate-200 border border-zinc-700 dark:border-zinc-700 light:border-slate-300 rounded-full overflow-hidden">
                      <div
                        className="progress-fill h-full rounded-full"
                        style={{
                          width: `${barWidth}%`,
                          background: isOverachieved
                            ? 'linear-gradient(90deg, #EA5D3A, #F2704E)'
                            : 'linear-gradient(90deg, #EA5D3A, #F2704E)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* All-Time Total — hidden on mobile */}
                <div className="hidden sm:block text-center font-mono">
                  <span className={`text-sm font-bold ${viewMode === 'allTime' ? 'text-[#EA5D3A]' : 'text-white dark:text-white light:text-slate-900'}`}>
                    {user.error ? '—' : (user.platformTotal || 0)}
                  </span>
                </div>

                {/* Status / Nudge */}
                <div className="text-center flex items-center justify-center">
                  {getStatusBadge(user)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200 flex items-center justify-between text-xs text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">
        <span>Hit {dailyTarget} problems daily to climb the leaderboard!</span>
        <span className="font-semibold text-[#EA5D3A] flex items-center gap-1 cursor-pointer hover:underline">
          {sortedLeaderboard.length} Squad Members Active <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

export default LeaderboardTable;
