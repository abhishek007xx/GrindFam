import React from 'react';
import { BarChart3, AlertCircle, Clock, Zap, Target, Layers, BrainCircuit } from 'lucide-react';

export default function ProblemAnalytics({ stats }) {
  const easySolved = stats?.easyCount || 42;
  const mediumSolved = stats?.mediumCount || 68;
  const hardSolved = stats?.hardCount || 18;
  const totalSolved = easySolved + mediumSolved + hardSolved;

  const totalAttempts = Math.round(totalSolved * 1.25);
  const acceptanceRatio = Math.min(100, Math.round((totalSolved / Math.max(1, totalAttempts)) * 100));

  // Topic mastery rates
  const topics = [
    { name: 'Arrays & Hashing', percent: 85, count: '34/40' },
    { name: 'Two Pointers', percent: 78, count: '18/23' },
    { name: 'Binary Search', percent: 70, count: '14/20' },
    { name: 'Trees & BST', percent: 62, count: '22/35' },
    { name: 'Graphs', percent: 22, count: '6/27', weak: true },
    { name: 'Dynamic Programming', percent: 15, count: '5/32', weak: true }
  ];

  // Algorithmic pattern mastery
  const patterns = [
    { name: 'Sliding Window', level: 'Advanced', percent: 82 },
    { name: 'Fast & Slow Pointers', level: 'Mastered', percent: 92 },
    { name: 'Monotonic Stack', level: 'Intermediate', percent: 65 },
    { name: 'Topological Sort', level: 'Needs Focus', percent: 28 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Difficulty Breakdown & Acceptance Ratio Grid */}
        <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-[#10B981] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Difficulty & Acceptance Ratio</h3>
                <p className="text-[11px] text-zinc-400">Accepted solutions vs total submission attempts</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {acceptanceRatio}% Success
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Easy */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-400">Easy ({easySolved})</span>
                <span className="font-mono text-zinc-400">35% of total</span>
              </div>
              <div className="w-full bg-zinc-900 border border-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-amber-400">Medium ({mediumSolved})</span>
                <span className="font-mono text-zinc-400">53% of total</span>
              </div>
              <div className="w-full bg-zinc-900 border border-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '53%' }} />
              </div>
            </div>

            {/* Hard */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-rose-400">Hard ({hardSolved})</span>
                <span className="font-mono text-zinc-400">12% of total</span>
              </div>
              <div className="w-full bg-zinc-900 border border-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Topic Mastery Radar */}
        <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-[#EA5D3A] flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Topic Completion Radar</h3>
                <p className="text-[11px] text-zinc-400">Data structures & algorithm coverage</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {topics.map(t => (
              <div key={t.name} className={`p-2.5 rounded-xl border ${t.weak ? 'bg-amber-500/5 border-amber-500/30' : 'bg-zinc-900/60 border-zinc-800'}`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-semibold truncate ${t.weak ? 'text-amber-400' : 'text-zinc-200'}`}>{t.name}</span>
                  <span className="font-mono text-[10px] text-zinc-400">{t.count}</span>
                </div>
                <div className="w-full bg-zinc-900 border border-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${t.weak ? 'bg-amber-500' : 'bg-[#10B981]'}`} style={{ width: `${t.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Algorithmic Pattern Mastery & Peak Time Efficiency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pattern & Paradigm Tracker */}
        <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Algorithmic Pattern Mastery</h3>
              <p className="text-[11px] text-zinc-400">Underlying problem-solving paradigms</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {patterns.map(p => (
              <div key={p.name} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <span className="text-xs font-semibold text-zinc-200">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">{p.level}</span>
                  <span className="text-xs font-mono font-bold text-[#10B981]">{p.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Spent & Peak Activity Efficiency */}
        <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-cyan-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Time Spent & Peak Efficiency</h3>
              <p className="text-[11px] text-zinc-400">Productivity window & solving speed</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-medium">Avg Easy</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">~10 mins</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-medium">Avg Medium</span>
              <span className="text-sm font-bold text-amber-400 font-mono">~24 mins</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-medium">Avg Hard</span>
              <span className="text-sm font-bold text-rose-400 font-mono">~45 mins</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Peak Productive Hours
            </span>
            <span className="text-xs font-mono font-bold text-white bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700">
              11:00 PM – 2:00 AM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
