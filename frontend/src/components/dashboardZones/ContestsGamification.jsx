import React, { useState } from 'react';
import { Trophy, Calendar, Award, Flame, ExternalLink, Zap, Check, Shield, Star } from 'lucide-react';

const UPCOMING_CONTESTS = [
  {
    id: 'lc-weekly-410',
    platform: 'LeetCode',
    title: 'Weekly Contest 410',
    time: 'Sun, Aug 10 • 8:00 AM IST',
    duration: '1h 30m',
    gcalUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=LeetCode+Weekly+Contest+410&details=Participate+in+LeetCode+Weekly+Contest&location=https://leetcode.com/contest/'
  },
  {
    id: 'cf-div2-965',
    platform: 'Codeforces',
    title: 'Codeforces Round 965 (Div. 2)',
    time: 'Mon, Aug 11 • 8:05 PM IST',
    duration: '2h 00m',
    gcalUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Codeforces+Round+965+(Div.+2)&details=Participate+in+Codeforces+Round&location=https://codeforces.com/contests'
  },
  {
    id: 'cc-starters-146',
    platform: 'CodeChef',
    title: 'Starters 146 (Rated for All)',
    time: 'Wed, Aug 13 • 8:00 PM IST',
    duration: '2h 00m',
    gcalUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=CodeChef+Starters+146&details=Participate+in+CodeChef+Starters&location=https://www.codechef.com/contests'
  }
];

export default function ContestsGamification({ platformTotal = 0 }) {
  const currentXP = (platformTotal % 10) * 50;
  const [reminders, setReminders] = useState({});

  const toggleReminder = (id) => {
    setReminders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentLevel = Math.max(1, Math.floor(platformTotal / 10) + 1);
  const getBadgeTitle = (lvl) => {
    if (lvl >= 10) return 'Grandmaster';
    if (lvl >= 5) return 'Algo Specialist';
    return 'Level 1 Grinder';
  };

  return (
    <div className="space-y-6">
      {/* 1. Gamified Level & XP Progression Bar */}
      <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EA5D3A] text-white flex items-center justify-center font-bold text-sm shadow-md">
              L{currentLevel}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA5D3A] bg-[#EA5D3A]/10 px-2 py-0.5 rounded border border-[#EA5D3A]/20">
                  {getBadgeTitle(currentLevel)}
                </span>
                <span className="text-xs text-zinc-400 font-mono">Total Solved: {platformTotal}</span>
              </div>
              <h3 className="text-base font-bold text-zinc-100 mt-0.5">Tier Progress & XP Rewards</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400">Easy = +10 XP</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400">Medium = +25 XP</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-rose-400">Hard = +50 XP</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Level {currentLevel} Progress</span>
            <span className="text-[#10B981] font-bold">{currentXP} / 500 XP</span>
          </div>
          <div className="w-full bg-zinc-900 border border-zinc-800 h-2 rounded-full overflow-hidden">
            <div className="bg-[#10B981] h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (currentXP / 500) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Grid: Contest Performance Rating & Upcoming Contest Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 2. Contest Performance Rating */}
        <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Contest Rating & Metrics</h3>
                <p className="text-[11px] text-zinc-400">LeetCode & competitive rating curve</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Knight Rank
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-medium">Current Rating</span>
              <span className="text-base font-bold text-white font-mono">1,842</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-medium">Peak Rating</span>
              <span className="text-base font-bold text-emerald-400 font-mono">1,920</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-medium">Global Rank</span>
              <span className="text-base font-bold text-cyan-400 font-mono">Top 3.5%</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-medium">Contests</span>
              <span className="text-base font-bold text-amber-400 font-mono">24</span>
            </div>
          </div>
        </div>

        {/* 3. Upcoming Contest Calendar & Reminders */}
        <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-cyan-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Upcoming Contest Calendar</h3>
                <p className="text-[11px] text-zinc-400">LeetCode, Codeforces & CodeChef schedules</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {UPCOMING_CONTESTS.map(c => (
              <div key={c.id} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                      {c.platform}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-100 truncate">{c.title}</h4>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono mt-1">{c.time} ({c.duration})</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={c.gcalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#EA5D3A] text-[10px] font-semibold flex items-center gap-1 transition-all border border-zinc-700"
                    title="Add to Google Calendar"
                  >
                    <Calendar className="w-3 h-3" /> +GCal
                  </a>
                  <button
                    onClick={() => toggleReminder(c.id)}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      reminders[c.id]
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                    }`}
                    title={reminders[c.id] ? 'Reminder Set' : 'Set In-App Reminder'}
                  >
                    {reminders[c.id] ? <Check className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
