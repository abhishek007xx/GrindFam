import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, BookOpen, Bookmark, Building2, CheckCircle2, Play, Star, Sparkles } from 'lucide-react';

export default function SpacedRepetitionVault() {
  const navigate = useNavigate();

  // Real Spaced Repetition Queue Items (default empty until user adds bookmarks)
  const [revisionQueue, setRevisionQueue] = useState([]);

  // Real Bookmarked questions vault (default empty until user adds bookmarks)
  const [bookmarks, setBookmarks] = useState([]);

  const handleResolve = (id) => {
    setRevisionQueue(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 1. Spaced Repetition Queue & Forgetting Curve */}
      <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-[#EA5D3A] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Spaced Repetition & Revision Queue</h3>
              <p className="text-[11px] text-zinc-400">Questions resurfaced based on Forgetting Curve (7, 14, 30 days)</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#EA5D3A] bg-[#EA5D3A]/10 px-2.5 py-1 rounded-full border border-[#EA5D3A]/20">
            {revisionQueue.length} Due Today
          </span>
        </div>

        <div className="space-y-2.5">
          {revisionQueue.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-900/50 rounded-xl border border-zinc-800">
              🎉 Revision Queue cleared! You're fully caught up for today.
            </div>
          ) : (
            revisionQueue.map(item => (
              <div key={item.id} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    item.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {item.difficulty}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 hover:text-[#EA5D3A] cursor-pointer" onClick={() => window.open(`https://leetcode.com/problems/${item.slug}`, '_blank')}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono">Last solved {item.lastSolved} • {item.tag}</p>
                  </div>
                </div>

                {/* Rating Resurface Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-medium hidden sm:inline">Rate recall:</span>
                  <button onClick={() => handleResolve(item.id)} className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-[10px] font-medium text-zinc-300 transition-colors">
                    Easy (30d)
                  </button>
                  <button onClick={() => handleResolve(item.id)} className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-400 text-[10px] font-medium text-zinc-300 transition-colors">
                    Good (14d)
                  </button>
                  <button onClick={() => handleResolve(item.id)} className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-[10px] font-medium text-zinc-300 transition-colors">
                    Hard (7d)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid: Sheet Progress Dashboard & Live Company Tag Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 2. Unified Sheet Tracker Dashboard */}
        <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-[#10B981] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">DSA Sheet Progress</h3>
                <p className="text-[11px] text-zinc-400">Curated sheet completion rates</p>
              </div>
            </div>
            <button onClick={() => navigate('/sheets')} className="text-xs text-[#EA5D3A] hover:underline font-medium">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Striver A2Z DSA Sheet', percent: 65, solved: '296 / 455', slug: 'striver-a2z' },
              { name: 'NeetCode 150', percent: 80, solved: '120 / 150', slug: 'neetcode-150' },
              { name: 'Blind 75', percent: 100, solved: '75 / 75', slug: 'blind-75' }
            ].map(s => (
              <div key={s.name} className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-100">{s.name}</span>
                  <span className="font-mono text-zinc-400">{s.solved} ({s.percent}%)</span>
                </div>
                <div className="w-full bg-zinc-900 border border-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${s.percent}%` }} />
                </div>
                {s.percent < 100 && (
                  <div className="flex justify-end pt-0.5">
                    <button onClick={() => navigate(`/sheet/${s.slug}`)} className="text-[11px] font-semibold text-[#EA5D3A] flex items-center gap-1 hover:underline">
                      <Play className="w-3 h-3 fill-[#EA5D3A]" /> Resume Last Unsolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Live Company Tag Tracker */}
        <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Live Company Tag Coverage</h3>
                <p className="text-[11px] text-zinc-400">Top 50 frequency questions solved</p>
              </div>
            </div>
            <button onClick={() => navigate('/companies')} className="text-xs text-[#EA5D3A] hover:underline font-medium">
              Company Kits
            </button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Google Top 50', percent: 40, count: '20 / 50' },
              { name: 'Meta / Facebook Top 50', percent: 70, count: '35 / 50' },
              { name: 'Amazon Top 50', percent: 55, count: '28 / 50' },
              { name: 'Microsoft Top 50', percent: 62, count: '31 / 50' }
            ].map(c => (
              <div key={c.name} className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-100">{c.name}</span>
                  <span className="font-mono text-[#10B981] font-semibold">{c.count} ({c.percent}%)</span>
                </div>
                <div className="w-full bg-zinc-900 border border-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${c.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Code Vault & Bookmarks */}
      <div className="dash-card bg-[#121318] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-purple-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Code Vault & Custom Bookmarks</h3>
              <p className="text-[11px] text-zinc-400">Tagged questions for last-minute interview prep</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {bookmarks.map(bm => (
            <div
              key={bm.slug}
              onClick={() => window.open(`https://leetcode.com/problems/${bm.slug}`, '_blank')}
              className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer space-y-1.5"
            >
              <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                {bm.category}
              </span>
              <h4 className="text-xs font-bold text-zinc-100 truncate hover:text-[#EA5D3A] mt-1">{bm.title}</h4>
              <p className="text-[10px] text-zinc-500 font-mono">Difficulty: {bm.difficulty}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
