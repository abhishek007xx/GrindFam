import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, Target, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export function TodayHabitHub({ userStreak = 14, activeTrackName = 'Google SDE Track', dailyXp = 250, targetXp = 300 }) {
  const navigate = useNavigate();
  const xpPercent = Math.min(100, Math.round((dailyXp / targetXp) * 100));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── 1. Hero Micro-Warmup Banner (Duolingo Style 3-Min Hook) ── */}
      <section className="bg-[#161B22] border border-[#EA5D3A]/40 rounded-xl p-6 md:p-8 shadow-xl relative overflow-hidden group hover:border-[#EA5D3A] transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA5D3A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] text-xs font-extrabold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3-Min Daily Micro Warmup</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
              Two Sum & Frequency Hash Warmup
            </h2>
            <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed">
              Complete this 3-minute quick problem to instantly lock in your <strong className="text-white">{userStreak}-day streak</strong> and earn +50 Bonus XP.
            </p>
          </div>

          <button
            onClick={() => navigate('/sheet/striver-s-a2z-dsa-course-sheet')}
            className="px-6 py-3 bg-[#EA5D3A] hover:bg-[#F2633F] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#EA5D3A]/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Warmup (3 Mins)</span>
          </button>
        </div>

        {/* XP Daily Goal Tracker Line */}
        <div className="mt-6 pt-4 border-t border-[#21262D] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#9CA3AF]">Daily Habit Progress</span>
            <span className="text-[#EA5D3A] font-mono">{dailyXp} / {targetXp} XP ({xpPercent}%)</span>
          </div>
          <div className="w-full bg-[#0D1117] h-2 rounded-full overflow-hidden border border-[#21262D]">
            <div
              className="bg-[#EA5D3A] h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* ── 2. Grid Cards: Target Company Path + Streak Protection Status ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Track Progress Card */}
        <div className="bg-[#161B22] border border-[#30363D] hover:border-[#4B5563] rounded-xl p-5 space-y-4 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-[#1F2937] border border-[#30363D] text-[#EA5D3A] text-[11px] font-bold">
                Active Career Path
              </span>
              <span className="text-xs text-[#10B981] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>14/25 Solved</span>
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#F3F4F6]">{activeTrackName}</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Next Milestone: <strong className="text-[#F3F4F6]">Binary Tree Lowest Common Ancestor</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/companies')}
            className="w-full py-2.5 bg-[#1F2937] hover:bg-[#252D3B] text-[#F3F4F6] border border-[#30363D] hover:border-[#EA5D3A]/50 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Continue Target Track</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#EA5D3A]" />
          </button>
        </div>

        {/* Streak Shield & Loss Aversion Status Card */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Streak Protected</span>
              </span>
              <span className="text-xs text-[#9CA3AF] font-mono">2 Shields Stored</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#F3F4F6]">{userStreak}-Day Streak Protection</h3>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-snug">
                Your streak freeze shield automatically activates if you miss a day due to work emergencies.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#21262D] flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>Next Freeze Reward: 7 Days</span>
            <span className="text-[#EA5D3A] font-bold font-mono">+100 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodayHabitHub;
