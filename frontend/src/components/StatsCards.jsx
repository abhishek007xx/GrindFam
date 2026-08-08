import React from 'react';
import { Users, CheckCircle2, Flame, TrendingUp, Pencil, Target, RefreshCw, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCards = ({ stats, dailyTarget = 5, onEditTarget, onSyncLeetCode, refreshing }) => {
  const { totalFriends = 0, hitTargetTodayCount = 0, yourTodayCount = 0, yourTargetHit = false, yourPlatformTotal = 0 } = stats || {};
  const target = stats?.dailyTarget || dailyTarget || 5;
  const totalSquadSize = Math.max(1, totalFriends + 1);
  const progressPercent = Math.min(100, Math.round((yourTodayCount / target) * 100));

  const donutRadius = 22;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutFill = donutCircumference * (1 - progressPercent / 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Squad Members */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="group relative overflow-hidden bg-gradient-to-b from-[#1E1E24] to-[#141417] border border-[#2D2D35] hover:border-cyan-500/40 rounded-2xl p-4 shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Active Squad
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">{totalSquadSize}</h3>
            <span className="text-xs text-zinc-400 font-medium">members</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>Squad Size</span>
          <span className="text-cyan-400 font-semibold">{totalSquadSize} Grinders</span>
        </div>
      </motion.div>

      {/* 2. Hit Target Today */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="group relative overflow-hidden bg-gradient-to-b from-[#1E1E24] to-[#141417] border border-[#2D2D35] hover:border-emerald-500/40 rounded-2xl p-4 shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              hitTargetTodayCount === totalSquadSize 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              {hitTargetTodayCount === totalSquadSize ? '🎯 100% Done' : `${totalSquadSize - hitTargetTodayCount} Pending`}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">{hitTargetTodayCount}</h3>
            <span className="text-sm font-bold text-zinc-500">/ {totalSquadSize}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium mb-1.5">
            <span>Squad Target</span>
            <span className="text-emerald-400 font-semibold">{Math.round((hitTargetTodayCount / totalSquadSize) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" 
              style={{ width: `${Math.min(100, (hitTargetTodayCount / totalSquadSize) * 100)}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* 3. Your Solved Today (Highlight Card) */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="group relative overflow-hidden bg-gradient-to-b from-[#241E1E] to-[#171414] border border-[#3A2925] hover:border-[#EA5D3A]/50 rounded-2xl p-4 shadow-lg hover:shadow-[#EA5D3A]/10 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#EA5D3A]/10 rounded-full blur-2xl group-hover:bg-[#EA5D3A]/20 transition-all pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3 gap-1">
            <div className="w-8 h-8 rounded-xl bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 flex items-center justify-center text-[#EA5D3A] group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
            <button
              onClick={onSyncLeetCode}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#EA5D3A] bg-[#EA5D3A]/10 hover:bg-[#EA5D3A]/20 border border-[#EA5D3A]/30 hover:border-[#EA5D3A]/60 px-2.5 py-1 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              title="Manual Sync LeetCode"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-amber-400 font-mono tracking-tight">
              {yourTodayCount}
            </h3>
            <span className="text-xs text-orange-400/80 font-semibold">solved today</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>Daily Goal</span>
          <span className={yourTodayCount >= target ? 'text-emerald-400 font-bold' : 'text-amber-400 font-semibold'}>
            {yourTodayCount >= target ? '🎯 Goal Met!' : `${target - yourTodayCount} left`}
          </span>
        </div>
      </motion.div>

      {/* 4. GrindFam Total */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="group relative overflow-hidden bg-gradient-to-b from-[#1E1E24] to-[#141417] border border-[#2D2D35] hover:border-purple-500/40 rounded-2xl p-4 shadow-lg hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400">
              ⚡ All-Time
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">{yourPlatformTotal || 0}</h3>
            <span className="text-xs text-zinc-400 font-medium">problems</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>Platform Total</span>
          <span className="text-purple-400 font-semibold">Level Progress</span>
        </div>
      </motion.div>

      {/* 5. Daily Target Card */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="group relative overflow-hidden bg-gradient-to-b from-[#1E1E24] to-[#141417] border border-[#2D2D35] hover:border-rose-500/40 rounded-2xl p-4 shadow-lg hover:shadow-rose-500/5 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-300">Daily Target</span>
            <button
              onClick={onEditTarget}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-[#EA5D3A] bg-zinc-800/60 hover:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700/50 transition-all cursor-pointer"
            >
              <span>Edit</span>
              <Pencil className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">{target}</h3>
                <span className="text-xs font-semibold text-zinc-500">/ day</span>
              </div>
              <p className="text-[11px] font-medium text-zinc-400 mt-0.5">{progressPercent}% achieved</p>
            </div>

            <div className="relative w-12 h-12 flex-shrink-0">
              <svg viewBox="0 0 54 54" className="w-full h-full -rotate-90">
                <circle cx="27" cy="27" r={donutRadius} fill="none" stroke="#26262B" strokeWidth="5" />
                <circle
                  cx="27" cy="27" r={donutRadius}
                  fill="none" stroke="url(#card-target-gradient)" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={donutCircumference}
                  strokeDashoffset={donutFill}
                  style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
                <defs>
                  <linearGradient id="card-target-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>Goal Status</span>
          <span className={progressPercent >= 100 ? 'text-emerald-400 font-bold' : 'text-zinc-400 font-semibold'}>
            {progressPercent >= 100 ? 'Completed 🎉' : 'In Progress'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsCards;
