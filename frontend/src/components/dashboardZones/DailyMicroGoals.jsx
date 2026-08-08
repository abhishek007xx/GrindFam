import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Square, ShieldAlert, Award, Flame, Check, Plus, RefreshCw,
  Trash2, Pencil, X, Edit3, Target, Calendar
} from 'lucide-react';

const STORAGE_KEY_GOALS = 'grindfam_daily_micro_goals';
const STORAGE_KEY_DATE = 'grindfam_micro_goals_date';
const STORAGE_KEY_FREEZE = 'grindfam_streak_freeze';

const DEFAULT_GOALS = [
  { id: 'goal-1', text: 'Solve 2 Medium Array problems', completed: false, xp: 50 },
  { id: 'goal-2', text: 'Solve 1 Hard Dynamic Programming problem', completed: false, xp: 50 },
  { id: 'goal-3', text: 'Review 1 Saved Code Note', completed: false, xp: 25 },
  { id: 'goal-4', text: 'Complete Daily Solved Target Quota', completed: false, xp: 75 }
];

export default function DailyMicroGoals({ onXPEarned, dailyTarget = 5, onUpdateTarget }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [goals, setGoals] = useState(() => {
    try {
      const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
      const savedGoals = localStorage.getItem(STORAGE_KEY_GOALS);
      
      // Auto-reset next day: If a new day has started, clear completed statuses
      if (savedDate && savedDate !== todayStr) {
        localStorage.setItem(STORAGE_KEY_DATE, todayStr);
        if (savedGoals) {
          const parsed = JSON.parse(savedGoals);
          // Uncheck completed goals for the new day
          const reset = parsed.map(g => ({ ...g, completed: false }));
          localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(reset));
          return reset;
        }
      }
      if (savedGoals) return JSON.parse(savedGoals);
    } catch (e) {
      console.error('Error loading micro goals:', e);
    }
    return DEFAULT_GOALS;
  });

  const [freezeTokens, setFreezeTokens] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FREEZE);
      if (saved) return parseInt(saved, 10);
    } catch (e) { console.error(e); }
    return 2;
  });

  const [isFreezeActive, setIsFreezeActive] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalXP, setNewGoalXP] = useState(25);
  const [isAdding, setIsAdding] = useState(false);

  // Edit Goal modal/inline state
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editXP, setEditXP] = useState(25);

  // Edit Daily Target modal
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetNum, setTargetNum] = useState(dailyTarget);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
    localStorage.setItem(STORAGE_KEY_DATE, todayStr);
  }, [goals, todayStr]);

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

  // ── REMOVE / DELETE GOAL FROM DAILY CHECKLIST ──
  const handleRemoveGoal = (id, e) => {
    e.stopPropagation();
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // ── EDIT GOAL ──
  const startEditGoal = (goal, e) => {
    e.stopPropagation();
    setEditingGoalId(goal.id);
    setEditText(goal.text);
    setEditXP(goal.xp || 25);
  };

  const saveEditGoal = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setGoals(prev => prev.map(g => g.id === editingGoalId ? { ...g, text: editText.trim(), xp: parseInt(editXP, 10) || 25 } : g));
    setEditingGoalId(null);
  };

  // ── ADD NEW GOAL ──
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newG = {
      id: `goal-custom-${Date.now()}`,
      text: newGoalText.trim(),
      completed: false,
      xp: parseInt(newGoalXP, 10) || 25
    };
    setGoals(prev => [...prev, newG]);
    setNewGoalText('');
    setIsAdding(false);
  };

  // ── RESET ALL FOR NEW DAY ──
  const handleResetForNewDay = () => {
    setGoals(prev => prev.map(g => ({ ...g, completed: false })));
  };

  // ── EDIT DAILY TARGET QUOTA ──
  const handleSaveTarget = (e) => {
    e.preventDefault();
    const parsed = parseInt(targetNum, 10);
    if (parsed > 0 && onUpdateTarget) {
      onUpdateTarget(parsed);
    }
    setIsEditingTarget(false);
  };

  const completedCount = goals.filter(g => g.completed).length;
  const progressPercent = Math.min(100, Math.round((completedCount / Math.max(1, goals.length)) * 100));

  return (
    <div className="dash-card bg-[#1E1E1E] border border-[#333333] rounded-2xl p-5 hover:border-zinc-700 transition-all space-y-4 shadow-lg">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              Daily Checklist & Micro-Goals
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                Auto-Resets Daily
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">Complete items to earn XP and boost daily pace</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1 border border-zinc-700 transition-all"
            title="Edit Daily Solved Target Quota"
          >
            <Target className="w-3.5 h-3.5 text-[#EA5D3A]" />
            <span>Target: {dailyTarget}</span>
          </button>

          <button
            onClick={handleResetForNewDay}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-all"
            title="Reset Checklist for New Day"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edit Target Form Modal overlay inside card */}
      {isEditingTarget && (
        <form onSubmit={handleSaveTarget} className="p-3 bg-[#141414] border border-[#EA5D3A]/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Edit Daily Target Quota</span>
            <button type="button" onClick={() => setIsEditingTarget(false)} className="text-zinc-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="50"
              value={targetNum}
              onChange={(e) => setTargetNum(e.target.value)}
              className="w-24 px-3 py-1.5 bg-[#262626] border border-[#333333] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#EA5D3A]"
            />
            <span className="text-xs text-zinc-400">problems / day</span>
            <button type="submit" className="px-3 py-1.5 bg-[#EA5D3A] text-white text-xs font-bold rounded-lg ml-auto">Save</button>
          </div>
        </form>
      )}

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
          <span>Today Progress: {completedCount} / {goals.length} Completed</span>
          <span className="text-[#10B981] font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-zinc-900 border border-zinc-800 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#EA5D3A] to-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Goals Checklist List */}
      <div className="space-y-2">
        {goals.map(item => (
          <div key={item.id}>
            {editingGoalId === item.id ? (
              <form onSubmit={saveEditGoal} className="p-2.5 bg-[#141414] border border-[#EA5D3A] rounded-xl flex items-center gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 px-2.5 py-1 bg-[#262626] border border-[#333333] rounded-lg text-xs text-white focus:outline-none"
                  autoFocus
                />
                <input
                  type="number"
                  value={editXP}
                  onChange={(e) => setEditXP(e.target.value)}
                  className="w-16 px-2 py-1 bg-[#262626] border border-[#333333] rounded-lg text-xs text-amber-400 font-mono"
                  placeholder="XP"
                />
                <button type="submit" className="px-2.5 py-1 bg-[#EA5D3A] text-white text-xs font-bold rounded-lg">Save</button>
                <button type="button" onClick={() => setEditingGoalId(null)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div
                onClick={() => toggleGoal(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  item.completed
                    ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 line-through'
                    : 'bg-[#262626] border-[#333333] hover:border-zinc-700 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.completed ? (
                    <div className="w-4 h-4 rounded bg-[#10B981] text-zinc-900 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <Square className="w-4 h-4 text-zinc-500 flex-shrink-0 group-hover:text-[#EA5D3A]" />
                  )}
                  <span className="text-xs font-medium truncate">{item.text}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    item.completed
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-900 text-amber-400 border-zinc-800'
                  }`}>
                    +{item.xp} XP
                  </span>

                  {/* EDIT GOAL BUTTON */}
                  <button
                    onClick={(e) => startEditGoal(item, e)}
                    className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="Edit Goal"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {/* REMOVE / DELETE GOAL BUTTON */}
                  <button
                    onClick={(e) => handleRemoveGoal(item.id, e)}
                    className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove goal from checklist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Goal Form */}
      {isAdding ? (
        <form onSubmit={handleAddGoal} className="flex flex-wrap items-center gap-2 pt-1">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="e.g., Solve 1 Graph BFS problem"
            className="flex-1 min-w-[180px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A]"
            autoFocus
          />
          <input
            type="number"
            value={newGoalXP}
            onChange={(e) => setNewGoalXP(e.target.value)}
            className="w-16 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-amber-400 font-mono text-center"
            placeholder="XP"
            title="XP reward"
          />
          <button type="submit" className="px-3 py-1.5 bg-[#EA5D3A] text-white text-xs font-semibold rounded-xl">Add</button>
          <button type="button" onClick={() => setIsAdding(false)} className="px-2 py-1.5 text-xs text-zinc-400 hover:text-white">Cancel</button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2 border border-dashed border-zinc-800 hover:border-[#EA5D3A]/60 rounded-xl text-xs font-medium text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-[#EA5D3A]" />
          <span>Add Custom Micro-Goal</span>
        </button>
      )}
    </div>
  );
}
