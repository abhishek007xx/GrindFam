import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, ShieldAlert, Award, Flame, Check, Plus, RefreshCw } from 'lucide-react';

const STORAGE_KEY_GOALS = 'grindfam_daily_micro_goals';
const STORAGE_KEY_FREEZE = 'grindfam_streak_freeze';

const DEFAULT_GOALS = [
  { id: 'goal-1', text: 'Solve 2 Medium Array problems', completed: false, xp: 50 },
  { id: 'goal-2', text: 'Solve 1 Hard Dynamic Programming problem', completed: false, xp: 50 },
  { id: 'goal-3', text: 'Review 1 Tricky Saved Note from Code Vault', completed: false, xp: 25 },
  { id: 'goal-4', text: 'Complete Daily Target Quota', completed: false, xp: 75 }
];

export default function DailyMicroGoals({ onXPEarned }) {
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return DEFAULT_GOALS;
  });

  const [freezeTokens, setFreezeTokens] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FREEZE);
      if (saved) return parseInt(saved, 10);
    } catch (e) { console.error(e); }
    return 2; // Default 2 tokens earned
  });

  const [isFreezeActive, setIsFreezeActive] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FREEZE, freezeTokens.toString());
  }, [freezeTokens]);

  const toggleGoal = (id) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextState = !g.completed;
        if (nextState && onXPEarned) {
          onXPEarned(g.xp);
        }
        return { ...g, completed: nextState };
      }
      return g;
    }));
  };

  const handleUseFreezeToken = () => {
    if (freezeTokens > 0 && !isFreezeActive) {
      setFreezeTokens(prev => prev - 1);
      setIsFreezeActive(true);
    }
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newG = {
      id: `goal-custom-${Date.now()}`,
      text: newGoalText.trim(),
      completed: false,
      xp: 25
    };
    setGoals(prev => [...prev, newG]);
    setNewGoalText('');
    setIsAdding(false);
  };

  const completedCount = goals.filter(g => g.completed).length;
  const progressPercent = Math.min(100, Math.round((completedCount / Math.max(1, goals.length)) * 100));

  return (
    <div className="dash-card bg-[#121215] border border-[#27272A] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-[#EA5D3A] flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Daily Checklist & Micro-Goals</h3>
            <p className="text-[11px] text-zinc-400">Complete items to earn XP and boost daily pace</p>
          </div>
        </div>

        {/* Streak Freeze Token Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUseFreezeToken}
            disabled={freezeTokens === 0 || isFreezeActive}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isFreezeActive
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : freezeTokens > 0
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed'
            }`}
            title="Freeze streak for exams/labs"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isFreezeActive ? 'Streak Shield Active' : `Freeze Token (${freezeTokens})`}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
          <span>Daily Goals: {completedCount} / {goals.length}</span>
          <span className="text-[#10B981] font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-zinc-900 border border-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Goals Checklist List */}
      <div className="space-y-2">
        {goals.map(item => (
          <div
            key={item.id}
            onClick={() => toggleGoal(item.id)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              item.completed
                ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 line-through'
                : 'bg-[#18181B] border-[#27272A] hover:border-zinc-700 text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.completed ? (
                <div className="w-4 h-4 rounded bg-[#10B981] text-zinc-900 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              ) : (
                <Square className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              )}
              <span className="text-xs font-medium truncate">{item.text}</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex-shrink-0 ${
              item.completed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              +{item.xp} XP
            </span>
          </div>
        ))}
      </div>

      {/* Add Custom Goal Button */}
      {isAdding ? (
        <form onSubmit={handleAddGoal} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="e.g., Solve 1 Graph BFS problem"
            className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A]"
            autoFocus
          />
          <button type="submit" className="px-3 py-1.5 bg-[#EA5D3A] text-white text-xs font-semibold rounded-xl">Add</button>
          <button type="button" onClick={() => setIsAdding(false)} className="px-2 py-1.5 text-xs text-zinc-400 hover:text-white">Cancel</button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Micro-Goal</span>
        </button>
      )}
    </div>
  );
}
