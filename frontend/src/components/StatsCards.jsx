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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-5">
      {/* Squad Members */}
      <div className="dash-card dash-card-hover p-3.5 bg-[#1E1E1E] border border-[#333333] rounded-xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">Active</span>
          </div>
          <h3 className="text-xl font-bold text-white font-mono tracking-tight">{totalSquadSize}</h3>
          <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">Squad Members</p>
        </div>
      </div>

      {/* Hit Target Today */}
      <div className="dash-card dash-card-hover p-3.5 bg-[#1E1E1E] border border-[#333333] rounded-xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#10B981]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">
              {hitTargetTodayCount === totalSquadSize ? 'Done' : `${totalSquadSize - hitTargetTodayCount} pending`}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white font-mono tracking-tight">
            {hitTargetTodayCount}<span className="text-xs text-zinc-400 font-normal font-sans">/{totalSquadSize}</span>
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">Hit Target Today</p>
        </div>
      </div>

      {/* Your Today's Count */}
      <div className="dash-card dash-card-hover p-3.5 bg-[#1E1E1E] border border-[#333333] rounded-xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2 gap-1">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#EA5D3A] flex-shrink-0">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <button
              onClick={onSyncLeetCode}
              disabled={refreshing}
              className="flex items-center gap-1 text-[9px] font-bold text-[#EA5D3A] bg-[#EA5D3A]/10 px-2 py-0.5 rounded-md border border-[#EA5D3A]/20 hover:bg-[#EA5D3A]/20 transition-all disabled:opacity-50 flex-shrink-0"
              title="Manual Sync LeetCode"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing' : 'Sync'}</span>
            </button>
          </div>
          <h3 className="text-xl font-bold text-white font-mono tracking-tight">{yourTodayCount}</h3>
          <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">Your Solved Today</p>
        </div>
      </div>

      {/* GrindFam Total */}
      <div className="dash-card dash-card-hover p-3.5 bg-[#1E1E1E] border border-[#333333] rounded-xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">All-time</span>
          </div>
          <h3 className="text-xl font-bold text-white font-mono tracking-tight">{yourPlatformTotal || 0}</h3>
          <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">GrindFam Total</p>
        </div>
      </div>

      {/* Daily Target Card */}
      <div className="dash-card dash-card-hover p-3.5 bg-[#1E1E1E] border border-[#333333] rounded-xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-semibold text-zinc-400">Daily Target</span>
            <button
              onClick={onEditTarget}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-[#EA5D3A] transition-colors"
            >
              Edit <Pencil className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white font-mono tracking-tight">{target} <span className="text-[10px] text-zinc-500 font-sans font-normal">/ day</span></h3>
            <div className="relative w-7 h-7 flex-shrink-0">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r={donutRadius} fill="none" stroke="#2C2C2C" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r={donutRadius}
                  fill="none" stroke="#10B981" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={donutCircumference}
                  strokeDashoffset={donutFill}
                  style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="w-2.5 h-2.5 text-[#10B981]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
