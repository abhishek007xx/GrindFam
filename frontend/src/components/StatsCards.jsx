import React from 'react';
import { Users, CheckCircle2, Flame, TrendingUp, Pencil, Target, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCards = ({ stats, dailyTarget = 5, onEditTarget, onSyncLeetCode, refreshing }) => {
  const { totalFriends = 0, hitTargetTodayCount = 0, yourTodayCount = 0, yourTargetHit = false, yourPlatformTotal = 0 } = stats || {};
  const target = stats?.dailyTarget || dailyTarget || 5;
  const totalSquadSize = Math.max(1, totalFriends + 1);
  const progressPercent = Math.min(100, Math.round((yourTodayCount / target) * 100));

  const donutRadius = 16;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutFill = donutCircumference * (1 - progressPercent / 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
      {/* 1. Squad Members */}
      <motion.div 
        whileHover={{ y: -1 }}
        className="group relative overflow-hidden bg-gradient-to-b from-[#1E1E24] to-[#141417] border border-[#2D2D35] hover:border-cyan-500/40 rounded-xl py-3 px-3.5 shadow-md transition-all duration-300 flex items-center justify-between min-h-[76px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-xl font-black text-white font-mono tracking-tight">{totalSquadSize}</h3>
              <span className="text-[11px] text-zinc-400 font-medium">members</span>
            </div>
            <p className="text-[10px] font-semibold text-zinc-400">Squad Size</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-bold text-cyan-400 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Active
        </span>
      </motion.div>

      {/* 2. Hit Target Today */}
      <motion.div 
        whileHover={{ y: -1 }}
        className="group relative overflow-hidden bg-gradient-to-b from-[#1E1E24] to-[#141417] border border-[#2D2D35] hover:border-emerald-500/40 rounded-xl py-3 px-3.5 shadow-md transition-all duration-300 flex items-center justify-between min-h-[76px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-black text-white font-mono tracking-tight">{hitTargetTodayCount}</h3>
              <span className="text-xs font-bold text-zinc-500">/{totalSquadSize}</span>
            </div>
            <p className="text-[10px] font-semibold text-zinc-400">Hit Target Today</p>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex-shrink-0 ${
          hitTargetTodayCount === totalSquadSize 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          {hitTargetTodayCount === totalSquadSize ? '🎯 Done' : `${totalSquadSize - hitTargetTodayCount} pending`}
        </span>
      </motion.div>

      {/* 3. Your Solved Today (Highlight Card) */}
      <motion.div 
        whileHover={{ y: -1 }}
        className="group relative overflow-hidden bg-gradient-to-b from-[#241E1E] to-[#171414] border border-[#3A2925] hover:border-[#EA5D3A]/50 rounded-xl py-3 px-3.5 shadow-md transition-all duration-300 flex items-center justify-between min-h-[76px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 flex items-center justify-center text-[#EA5D3A] flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-amber-400 font-mono tracking-tight">
                {yourTodayCount}
              </h3>
              <span className="text-[11px] text-orange-400/80 font-semibold">solved today</span>
            </div>
            <p className="text-[10px] font-semibold text-zinc-400">Your Progress</p>
          </div>
        </div>

        <button
          onClick={onSyncLeetCode}
          disabled={refreshing}
          className="flex items-center gap-1 text-[9px] font-extrabold text-[#EA5D3A] bg-[#EA5D3A]/10 hover:bg-[#EA5D3A]/20 border border-[#EA5D3A]/30 px-2 py-0.5 rounded-lg transition-all disabled:opacity-50 flex-shrink-0 cursor-pointer"
          title="Manual Sync LeetCode"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Syncing' : 'Sync'}</span>
        </button>
      </motion.div>

      {/* 4. GrindFam Total */}
      <motion.div 
        whileHover={{ y: -1 }}
        className="group relative overflow-hidden bg-gradient-to-b from-[#1E1E24] to-[#141417] border border-[#2D2D35] hover:border-purple-500/40 rounded-xl py-3 px-3.5 shadow-md transition-all duration-300 flex items-center justify-between min-h-[76px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-xl font-black text-white font-mono tracking-tight">{yourPlatformTotal || 0}</h3>
              <span className="text-[11px] text-zinc-400 font-medium">problems</span>
            </div>
            <p className="text-[10px] font-semibold text-zinc-400">GrindFam Total</p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400 flex-shrink-0">
          ⚡ All-Time
        </span>
      </motion.div>

      {/* 5. Daily Target Card */}
      <motion.div 
        whileHover={{ y: -1 }}
        className="group relative overflow-hidden bg-gradient-to-b from-[#1E1E24] to-[#141417] border border-[#2D2D35] hover:border-rose-500/40 rounded-xl py-3 px-3.5 shadow-md transition-all duration-300 flex items-center justify-between min-h-[76px]"
      >
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] font-bold text-zinc-300">Daily Target</span>
            <button
              onClick={onEditTarget}
              className="text-[9px] font-bold text-zinc-400 hover:text-[#EA5D3A] ml-1 transition-colors cursor-pointer"
            >
              <Pencil className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-1">
            <h3 className="text-xl font-black text-white font-mono tracking-tight">{target}</h3>
            <span className="text-[10px] font-semibold text-zinc-500">/ day</span>
          </div>
          <p className="text-[9px] font-medium text-emerald-400">{progressPercent}% achieved</p>
        </div>

        <div className="relative w-9 h-9 flex-shrink-0">
          <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
            <circle cx="20" cy="20" r={donutRadius} fill="none" stroke="#26262B" strokeWidth="4" />
            <circle
              cx="20" cy="20" r={donutRadius}
              fill="none" stroke="url(#slim-target-gradient)" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={donutCircumference}
              strokeDashoffset={donutFill}
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
            <defs>
              <linearGradient id="slim-target-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#14B8A6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsCards;
