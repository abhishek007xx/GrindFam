import React, { useState } from 'react';
import { Trophy, Flame, CheckCircle2, AlertCircle, ArrowRight, Calendar, Globe } from 'lucide-react';

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

const LeaderboardTable = ({ leaderboard = [], dailyTarget = 5, onRemoveFriend, removingId }) => {
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'allTime'

  // Sort leaderboard based on viewMode
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (viewMode === 'allTime') {
      const totalA = a.platformTotal || 0;
      const totalB = b.platformTotal || 0;
      if (totalB !== totalA) return totalB - totalA;
      return (b.todayCount || 0) - (a.todayCount || 0);
    }
    // Default 'today'
    if ((b.todayCount || 0) !== (a.todayCount || 0)) {
      return (b.todayCount || 0) - (a.todayCount || 0);
    }
    return (b.platformTotal || 0) - (a.platformTotal || 0);
  }).map((item, idx) => ({ ...item, displayRank: idx + 1 }));

  const getRankDisplay = (rank) => {
    if (rank === 1) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-400 font-black text-xs border border-yellow-500/40">1</span>;
    if (rank === 2) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400/15 text-slate-300 font-black text-xs border border-slate-400/30">2</span>;
    if (rank === 3) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 font-black text-xs border border-emerald-500/30">3</span>;
    return <span className="text-sm font-bold text-[#6e7681] ml-1">{rank}</span>;
  };

  const getStatusBadge = (user) => {
    if (user.error) {
      return <span className="text-xs text-red-400 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Error</span>;
    }
    const isOverachieved = user.todayCount > dailyTarget;
    const isTargetHit = user.todayCount >= dailyTarget;

    if (isOverachieved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/12 text-orange-400 border border-orange-500/25 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5" /> Overachieved
          <span className="text-orange-300 font-bold ml-0.5">+{user.todayCount - dailyTarget}</span>
        </span>
      );
    }
    if (isTargetHit) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22c55e]/12 text-[#22c55e] border border-[#22c55e]/25 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Hit Target
        </span>
      );
    }
    const percent = Math.round((user.todayCount / dailyTarget) * 100);
    if (percent >= 60) return <span className="text-xs text-[#8b949e] font-medium">On Track</span>;
    return <span className="text-xs text-[#6e7681] font-medium">Keep Going</span>;
  };

  return (
    <div className="dash-card overflow-hidden">
      {/* Header with View Mode Filter */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          <Trophy className="w-4.5 h-4.5 text-yellow-500" />
          <h2 className="text-[15px] font-bold text-white">Squad Leaderboard</h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-[#0d1117] p-1 rounded-xl border border-[#21262d]">
          <button
            onClick={() => setViewMode('today')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'today'
                ? 'bg-[#22c55e] text-white shadow-md'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Today</span>
          </button>

          <button
            onClick={() => setViewMode('allTime')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'allTime'
                ? 'bg-[#22c55e] text-white shadow-md'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>All-Time</span>
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[50px_1fr_110px_1fr_110px_120px] items-center px-5 py-2.5 text-[11px] font-semibold text-[#6e7681] uppercase tracking-wider border-b border-[#21262d]/60">
        <span>Rank</span>
        <span>Member</span>
        <span className={`text-center ${viewMode === 'today' ? 'text-[#22c55e] font-bold' : ''}`}>Today's Solved</span>
        <span className="text-center">Progress</span>
        <span className={`text-center ${viewMode === 'allTime' ? 'text-[#22c55e] font-bold' : ''}`}>All-Time Total</span>
        <span className="text-center">Status</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#21262d]/50">
        {sortedLeaderboard.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#6e7681]">No grinders yet. Add friends to compete!</div>
        ) : (
          sortedLeaderboard.map((user) => {
            const progressPercent = Math.min(140, Math.round((user.todayCount / dailyTarget) * 100));
            const barWidth = Math.min(100, progressPercent);
            const isOverachieved = user.todayCount > dailyTarget;
            const isTargetHit = user.todayCount >= dailyTarget;
            const gradient = getAvatarGradient(user.name || user.id);
            const initials = getInitials(user.name);

            let rowBg = 'hover:bg-white/[0.02]';
            if (user.displayRank === 1) rowBg = 'bg-yellow-500/[0.04] hover:bg-yellow-500/[0.07]';
            else if (user.isSelf) rowBg = 'bg-[#22c55e]/[0.04] hover:bg-[#22c55e]/[0.07]';

            return (
              <div
                key={user.id}
                className={`grid grid-cols-[50px_1fr_110px_1fr_110px_120px] items-center px-5 py-3.5 transition-colors ${rowBg}`}
              >
                {/* Rank */}
                <div>{getRankDisplay(user.displayRank)}</div>

                {/* Member */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-[11px] border border-white/15 flex-shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#e6edf3]">{user.name}</span>
                      {user.isSelf && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">(You)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Today's Solved */}
                <div className="text-center">
                  <span className={`text-sm font-bold ${viewMode === 'today' ? 'text-[#22c55e]' : 'text-white'}`}>
                    {user.todayCount}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="px-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold min-w-[36px] ${isTargetHit ? 'text-[#22c55e]' : 'text-[#8b949e]'}`}>
                      {progressPercent}%
                    </span>
                    <div className="flex-1 progress-track h-2">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${barWidth}%`,
                          background: isOverachieved
                            ? 'linear-gradient(90deg, #22c55e, #f59e0b)'
                            : 'linear-gradient(90deg, #22c55e, #16a34a)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* All-Time Total */}
                <div className="text-center">
                  <span className={`text-sm font-bold ${viewMode === 'allTime' ? 'text-[#22c55e]' : 'text-white'}`}>
                    {user.error ? '—' : (user.platformTotal || 0)}
                  </span>
                </div>

                {/* Status */}
                <div className="text-center">
                  {getStatusBadge(user)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#21262d] text-center">
        <span className="text-xs font-medium text-[#8b949e] hover:text-[#22c55e] cursor-pointer inline-flex items-center gap-1 transition-colors">
          Showing {viewMode === 'today' ? "Today's" : "All-Time"} Rankings <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

export default LeaderboardTable;
