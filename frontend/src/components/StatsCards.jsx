import React from 'react';
import { Users, CheckCircle2, Flame, TrendingUp, Pencil, Target, RefreshCw } from 'lucide-react';

const StatsCards = ({ stats, dailyTarget = 5, onEditTarget, onSyncLeetCode, refreshing }) => {
  const { totalFriends = 0, hitTargetTodayCount = 0, yourTodayCount = 0, yourTargetHit = false, yourPlatformTotal = 0 } = stats || {};
  const target = stats?.dailyTarget || dailyTarget || 5;
  const totalSquadSize = totalFriends + 1;
  const progressPercent = Math.min(100, Math.round((yourTodayCount / target) * 100));

  const donutRadius = 28;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutFill = donutCircumference * (1 - progressPercent / 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Squad Members */}
      <div className="dash-card dash-card-hover p-5 bg-[#121215] border border-[#27272A] rounded-2xl shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-slate-100 border border-zinc-800 dark:border-zinc-800 light:border-slate-200 flex items-center justify-center mb-3 text-zinc-300 dark:text-zinc-300 light:text-slate-700">
          <Users className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 font-mono tracking-tight">{totalSquadSize}</h3>
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 mt-0.5">Squad Members</p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 mt-0.5">Active in squad</p>
      </div>

      {/* Hit Target Today */}
      <div className="dash-card dash-card-hover p-5 bg-[#121215] border border-[#27272A] rounded-2xl shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 text-[#10B981]">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 font-mono tracking-tight">
          {hitTargetTodayCount}<span className="text-sm text-zinc-400 dark:text-zinc-400 light:text-slate-500 font-normal font-sans">/{totalSquadSize}</span>
        </h3>
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 mt-0.5">Hit Target Today</p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 mt-0.5">
          {hitTargetTodayCount === totalSquadSize ? 'Crushed it!' : `${totalSquadSize - hitTargetTodayCount} pending`}
        </p>
      </div>

      {/* Your Today's Count */}
      <div className="dash-card dash-card-hover p-5 bg-[#121215] border border-[#27272A] rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#EA5D3A]">
              <Flame className="w-4 h-4" />
            </div>
            {/* Sync LeetCode Button */}
            <button
              onClick={onSyncLeetCode}
              disabled={refreshing}
              className="flex items-center gap-1 text-[10px] font-semibold text-[#EA5D3A] bg-[#EA5D3A]/10 px-2 py-1 rounded-lg border border-[#EA5D3A]/20 hover:bg-[#EA5D3A]/20 transition-all disabled:opacity-50"
              title="Manual Sync LeetCode"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync LeetCode'}
            </button>
          </div>
          <h3 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 font-mono tracking-tight">{yourTodayCount}</h3>
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 mt-0.5">Your Solved Today</p>
        </div>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 mt-1">
          {yourTargetHit ? 'Target completed' : yourTodayCount === 0 ? 'Not started yet' : 'Keep grinding!'}
        </p>
      </div>

      {/* GrindFam Total */}
      <div className="dash-card dash-card-hover p-5 bg-[#121215] border border-[#27272A] rounded-2xl shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-slate-100 border border-zinc-800 dark:border-zinc-800 light:border-slate-200 flex items-center justify-center mb-3 text-zinc-300 dark:text-zinc-300 light:text-slate-700">
          <TrendingUp className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 font-mono tracking-tight">{yourPlatformTotal || 0}</h3>
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 mt-0.5">GrindFam Total</p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 mt-0.5">All-time solved</p>
      </div>

      {/* Daily Target Card */}
      <div className="dash-card dash-card-hover p-5 bg-[#121215] border border-[#27272A] rounded-2xl shadow-sm col-span-2 lg:col-span-1 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 mb-0.5">Daily Target</p>
          <h3 className="text-3xl font-bold text-white dark:text-white light:text-slate-900 font-mono tracking-tight">{target}</h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 mb-2">problems / day</p>
          <button
            onClick={onEditTarget}
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-[#EA5D3A] transition-colors"
          >
            Edit Goal <Pencil className="w-3 h-3" />
          </button>
        </div>
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r={donutRadius} fill="none" stroke="currentColor" className="text-zinc-800 dark:text-zinc-800 light:text-slate-200" strokeWidth="5" />
            <circle
              cx="40" cy="40" r={donutRadius}
              fill="none" stroke="#10B981" strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={donutCircumference}
              strokeDashoffset={donutFill}
              style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-4 h-4 text-[#10B981]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
