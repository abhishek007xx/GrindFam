import React from 'react';
import { Users, CheckCircle2, Flame, TrendingUp, Pencil, Target } from 'lucide-react';

const StatsCards = ({ stats, dailyTarget = 5, onEditTarget }) => {
  const { totalFriends = 0, hitTargetTodayCount = 0, yourTodayCount = 0, yourTargetHit = false, yourPlatformTotal = 0 } = stats || {};
  const target = stats?.dailyTarget || dailyTarget || 5;
  const totalSquadSize = totalFriends + 1;
  const progressPercent = Math.min(100, Math.round((yourTodayCount / target) * 100));

  // SVG donut for Daily Target card
  const donutRadius = 30;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutFill = donutCircumference * (1 - progressPercent / 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Squad Members — Neutral Muted Box */}
      <div className="dash-card dash-card-hover p-4 bg-[#121212] border border-white/[0.08] rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center mb-3 text-[#8b949e]">
          <Users className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-black text-white">{totalSquadSize}</h3>
        <p className="text-xs font-bold text-[#8b949e] mt-0.5">Squad Members</p>
        <p className="text-[10px] text-[#6e7681] mt-0.5">Active in squad</p>
      </div>

      {/* Hit Target Today — Emphasized Card */}
      <div className="dash-card dash-card-hover p-4 bg-[#121212] border border-white/[0.08] rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 flex items-center justify-center mb-3 text-[#EA5D3A]">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-black text-white">
          {hitTargetTodayCount}<span className="text-sm text-[#8b949e] font-semibold">/{totalSquadSize}</span>
        </h3>
        <p className="text-xs font-bold text-[#8b949e] mt-0.5">Hit Target Today</p>
        <p className="text-[10px] text-[#6e7681] mt-0.5">
          {hitTargetTodayCount === totalSquadSize ? 'Crushed it! 💪' : `${totalSquadSize - hitTargetTodayCount} pending`}
        </p>
      </div>

      {/* Your Today's Count — Neutral Box with Orange Accent Indicator */}
      <div className="dash-card dash-card-hover p-4 bg-[#121212] border border-white/[0.08] rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center mb-3 text-[#EA5D3A]">
          <Flame className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-black text-white">{yourTodayCount}</h3>
        <p className="text-xs font-bold text-[#8b949e] mt-0.5">Your Solved Today</p>
        <p className="text-[10px] text-[#6e7681] mt-0.5">
          {yourTargetHit ? 'Target completed 🔥' : yourTodayCount === 0 ? 'Not started yet' : 'Keep grinding!'}
        </p>
      </div>

      {/* GrindFam Total — Neutral Muted Box */}
      <div className="dash-card dash-card-hover p-4 bg-[#121212] border border-white/[0.08] rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center mb-3 text-[#8b949e]">
          <TrendingUp className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-black text-white">{yourPlatformTotal || 0}</h3>
        <p className="text-xs font-bold text-[#8b949e] mt-0.5">GrindFam Total</p>
        <p className="text-[10px] text-[#6e7681] mt-0.5">All-time solved</p>
      </div>

      {/* Daily Target Card */}
      <div className="dash-card dash-card-hover p-4 bg-[#121212] border border-white/[0.08] rounded-xl col-span-2 lg:col-span-1 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#8b949e] mb-0.5">Daily Target</p>
          <h3 className="text-3xl font-black text-white">{target}</h3>
          <p className="text-[10px] text-[#6e7681] mb-2">problems / day</p>
          <button
            onClick={onEditTarget}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#8b949e] hover:text-[#EA5D3A] transition-colors"
          >
            Edit Target <Pencil className="w-3 h-3" />
          </button>
        </div>
        {/* Donut Ring */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r={donutRadius} fill="none" stroke="#21262d" strokeWidth="6" />
            <circle
              cx="40" cy="40" r={donutRadius}
              fill="none" stroke="#EA5D3A" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={donutCircumference}
              strokeDashoffset={donutFill}
              style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-4 h-4 text-[#EA5D3A]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
