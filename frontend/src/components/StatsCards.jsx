import React from 'react';
import { Users, CheckCircle2, Flame, TrendingUp, Pencil, Target } from 'lucide-react';

const StatsCards = ({ stats, dailyTarget = 5, onEditTarget }) => {
  const { totalFriends = 0, hitTargetTodayCount = 0, yourTodayCount = 0, yourTargetHit = false, yourPlatformTotal = 0 } = stats || {};
  const target = stats?.dailyTarget || dailyTarget || 5;
  const totalSquadSize = totalFriends + 1;
  const progressPercent = Math.min(100, Math.round((yourTodayCount / target) * 100));

  // SVG donut for Daily Target card
  const donutRadius = 28;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutFill = donutCircumference * (1 - progressPercent / 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Squad Members */}
      <div className="dash-card dash-card-hover p-5 bg-[#161B22] border border-[#30363D] rounded-lg">
        <div className="w-8 h-8 rounded-md bg-[#1F2937] border border-[#30363D] flex items-center justify-center mb-3 text-[#9CA3AF]">
          <Users className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-bold text-[#F3F4F6] font-mono tracking-tight">{totalSquadSize}</h3>
        <p className="text-xs font-semibold text-[#9CA3AF] mt-0.5">Squad Members</p>
        <p className="text-[10px] text-[#6B7280] mt-0.5">Active in squad</p>
      </div>

      {/* Hit Target Today — Semantic Green Accent for Target Hit (#10B981) */}
      <div className="dash-card dash-card-hover p-5 bg-[#161B22] border border-[#30363D] rounded-lg">
        <div className="w-8 h-8 rounded-md bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center mb-3 text-[#10B981]">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-bold text-[#F3F4F6] font-mono tracking-tight">
          {hitTargetTodayCount}<span className="text-sm text-[#9CA3AF] font-normal font-sans">/{totalSquadSize}</span>
        </h3>
        <p className="text-xs font-semibold text-[#9CA3AF] mt-0.5">Hit Target Today</p>
        <p className="text-[10px] text-[#6B7280] mt-0.5">
          {hitTargetTodayCount === totalSquadSize ? 'Crushed it! 💪' : `${totalSquadSize - hitTargetTodayCount} pending`}
        </p>
      </div>

      {/* Your Today's Count */}
      <div className="dash-card dash-card-hover p-5 bg-[#161B22] border border-[#30363D] rounded-lg">
        <div className="w-8 h-8 rounded-md bg-[#1F2937] border border-[#30363D] flex items-center justify-center mb-3 text-[#EA5D3A]">
          <Flame className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-bold text-[#F3F4F6] font-mono tracking-tight">{yourTodayCount}</h3>
        <p className="text-xs font-semibold text-[#9CA3AF] mt-0.5">Your Solved Today</p>
        <p className="text-[10px] text-[#6B7280] mt-0.5">
          {yourTargetHit ? 'Target completed 🔥' : yourTodayCount === 0 ? 'Not started yet' : 'Keep grinding!'}
        </p>
      </div>

      {/* GrindFam Total */}
      <div className="dash-card dash-card-hover p-5 bg-[#161B22] border border-[#30363D] rounded-lg">
        <div className="w-8 h-8 rounded-md bg-[#1F2937] border border-[#30363D] flex items-center justify-center mb-3 text-[#9CA3AF]">
          <TrendingUp className="w-4 h-4" />
        </div>
        <h3 className="text-2xl font-bold text-[#F3F4F6] font-mono tracking-tight">{yourPlatformTotal || 0}</h3>
        <p className="text-xs font-semibold text-[#9CA3AF] mt-0.5">GrindFam Total</p>
        <p className="text-[10px] text-[#6B7280] mt-0.5">All-time solved</p>
      </div>

      {/* Daily Target Card */}
      <div className="dash-card dash-card-hover p-5 bg-[#161B22] border border-[#30363D] rounded-lg col-span-2 lg:col-span-1 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Daily Target</p>
          <h3 className="text-3xl font-bold text-[#F3F4F6] font-mono tracking-tight">{target}</h3>
          <p className="text-[10px] text-[#6B7280] mb-2">problems / day</p>
          <button
            onClick={onEditTarget}
            className="flex items-center gap-1 text-[11px] font-medium text-[#9CA3AF] hover:text-[#EA5D3A] transition-colors"
          >
            Edit Goal <Pencil className="w-3 h-3" />
          </button>
        </div>
        {/* Donut Ring in Semantic Muted Green (#10B981) */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r={donutRadius} fill="none" stroke="#21262D" strokeWidth="5" />
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
