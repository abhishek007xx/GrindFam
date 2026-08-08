import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ShieldAlert, Award, Calendar, Zap, X, CheckCircle2 } from 'lucide-react';

export default function StreakModal({ isOpen, onClose, streakDays = 0, platformTotal = 0 }) {
  if (!isOpen) return null;

  const longestStreak = Math.max(streakDays, 7);
  const xpBonus = streakDays * 20;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-[#1E1E1E] border border-[#333333] rounded-2xl p-6 shadow-2xl space-y-5 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Flame className="w-5 h-5 fill-amber-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Daily Streak Engine</h3>
                <p className="text-xs text-zinc-400">Consistency is your ultimate superpower</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Big Streak Counter */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#EA5D3A]/20 to-red-500/15 border border-[#EA5D3A]/40 text-center space-y-2 relative overflow-hidden">
            <Flame className="w-20 h-20 text-amber-500/10 absolute -right-2 -bottom-2 pointer-events-none" />
            <span className="text-4xl font-extrabold font-mono text-amber-400 tracking-tight flex items-center justify-center gap-2">
              <Flame className="w-8 h-8 text-amber-400 fill-amber-400" />
              {streakDays} DAYS
            </span>
            <p className="text-xs font-semibold text-zinc-200">
              {streakDays > 0 ? '🔥 You are on FIRE! Solved problems today.' : '⚡ Solve 1 problem today to activate your streak!'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-3 bg-[#141414] border border-[#333333] rounded-xl space-y-1">
              <p className="text-[10px] text-zinc-400">Longest Streak</p>
              <p className="font-extrabold font-mono text-white">{longestStreak} Days</p>
            </div>

            <div className="p-3 bg-[#141414] border border-[#333333] rounded-xl space-y-1">
              <p className="text-[10px] text-zinc-400">Streak Bonus XP</p>
              <p className="font-extrabold font-mono text-amber-400">+{xpBonus} XP</p>
            </div>

            <div className="p-3 bg-[#141414] border border-[#333333] rounded-xl space-y-1">
              <p className="text-[10px] text-zinc-400">Streak Freeze</p>
              <p className="font-extrabold font-mono text-emerald-400">2 Active</p>
            </div>
          </div>

          {/* Micro Tip */}
          <div className="p-3 bg-[#141414] border border-[#333333] rounded-xl text-xs text-zinc-300 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-[#EA5D3A] flex-shrink-0" />
            <span>Pro-Tip: Solving at least 1 LeetCode problem every 24 hours maintains your streak streak status globally!</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#EA5D3A] text-white text-xs font-bold rounded-xl shadow-lg hover:bg-[#f2704e] transition-all"
          >
            Keep Grinding 🔥
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
