import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, CheckCircle2, ArrowRight, ShieldCheck, Users, Circle, X, Code, Zap } from 'lucide-react';

export function TodayHabitHub({
  userStreak = 0,
  activeTrackName = 'Google SDE Track',
  dailyXp = 0,
  targetXp = 300,
  shieldsAvailable = 0,
  isShieldActive = false,
  activeSquad = null,
  members = [],
  squadWeeklyProgress = null
}) {
  const navigate = useNavigate();
  const xpPercent = Math.min(100, Math.round((dailyXp / targetXp) * 100));
  const [showWarmupModal, setShowWarmupModal] = React.useState(false);
  const [warmupCode, setWarmupCode] = React.useState('function twoSum(nums, target) {\n  \n}');

  // Online members (active in last 24h) memoized for performance
  const onlineMembers = useMemo(() => members.filter(m => m.isOnline), [members]);
  const podCapacity = activeSquad?.max_members || 10;
  const memberCount = members.length;

  return (
    <div
      role="tabpanel"
      id="today-panel"
      aria-labelledby="tab-today"
      className="space-y-6 animate-fadeIn"
    >
      {/* ── 1. Hero Micro-Warmup Banner (Duolingo Style 3-Min Hook) ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#121215] border border-[#EA5D3A]/40 rounded-xl p-6 md:p-8 shadow-xl relative overflow-hidden group hover:border-[#EA5D3A] transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA5D3A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] text-xs font-extrabold uppercase">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>3-Min Daily Micro Warmup</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#F4F4F5] tracking-tight">
              Two Sum & Frequency Hash Warmup
            </h2>
            <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed">
              Complete this 3-minute quick problem to instantly lock in your <strong className="text-white">{userStreak}-day streak</strong> and earn +50 Bonus XP.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowWarmupModal(true)}
            aria-label="Start 3-minute micro warmup problem"
            className="px-6 py-3 bg-[#EA5D3A] hover:bg-[#F2633F] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#EA5D3A]/25 transition-all flex items-center justify-center gap-2 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#121215]"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Start Warmup (3 Mins)</span>
          </motion.button>
        </div>

        {/* XP Daily Goal Tracker Line */}
        <div className="mt-6 pt-4 border-t border-[#222225] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#9CA3AF]">Daily Habit Progress</span>
            <span className="text-[#EA5D3A] font-mono">{dailyXp} / {targetXp} XP ({xpPercent}%)</span>
          </div>
          <div className="w-full bg-[#09090B] h-2 rounded-full overflow-hidden border border-[#222225]" role="progressbar" aria-valuenow={xpPercent} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="bg-[#EA5D3A] h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </motion.section>

      {/* ── 2. Grid Cards: Target Company Path + Streak Protection + Active Squad Pod ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Active Track Progress Card */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-[#121215] border border-[#27272A] hover:border-[#4B5563] rounded-xl p-5 space-y-4 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[#EA5D3A] text-[11px] font-bold">
                Active Career Path
              </span>
              <span className="text-xs text-[#10B981] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>14/25 Solved</span>
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#F4F4F5]">{activeTrackName}</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Next Milestone: <strong className="text-[#F4F4F5]">Binary Tree Lowest Common Ancestor</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/companies')}
            className="w-full py-2.5 bg-[#18181B] hover:bg-[#252D3B] text-[#F4F4F5] border border-[#27272A] hover:border-[#EA5D3A]/50 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A]"
          >
            <span>Continue Target Track</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#EA5D3A]" aria-hidden="true" />
          </button>
        </motion.article>

        {/* Streak Shield Status Card */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="bg-[#121215] border border-[#27272A] rounded-xl p-5 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded border text-[11px] font-bold flex items-center gap-1 ${
                isShieldActive
                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                  : 'bg-[#18181B] text-[#6B7280] border-[#27272A]'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isShieldActive ? 'Streak Protected' : 'No Shield'}</span>
              </span>
              <span className="text-xs text-[#9CA3AF] font-mono">
                {shieldsAvailable} Shield{shieldsAvailable !== 1 ? 's' : ''} Stored
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#F4F4F5]">{userStreak}-Day Streak Protection</h3>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-snug">
                Your streak freeze shield automatically activates if you miss a day due to work emergencies.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#222225] flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>Next Freeze Reward: 7 Days</span>
            <span className="text-[#EA5D3A] font-bold font-mono">+100 XP</span>
          </div>
        </motion.article>

        {/* Active Squad Pod Summary Card */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="bg-[#121215] border border-[#27272A] hover:border-[#4B5563] rounded-xl p-5 space-y-4 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[#EA5D3A] text-[11px] font-bold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Active Squad Pod</span>
              </span>
              <span className="text-xs text-[#9CA3AF] font-mono">
                {memberCount}/{podCapacity} Members
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#F4F4F5]">
                {activeSquad?.name || 'No Active Squad'}
              </h3>
              {squadWeeklyProgress && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9CA3AF]">Weekly Goal</span>
                    <span className="text-[#10B981] font-mono font-bold">
                      {squadWeeklyProgress.current}/{squadWeeklyProgress.target} Solved
                    </span>
                  </div>
                  <div className="w-full bg-[#09090B] h-1.5 rounded-full overflow-hidden border border-[#222225]">
                    <div
                      className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((squadWeeklyProgress.current / squadWeeklyProgress.target) * 100))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Online Pod Members Mini-Roster */}
            {onlineMembers.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#222225]">
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Online Now</p>
                <div className="space-y-1">
                  {onlineMembers.slice(0, 3).map((m, i) => (
                    <div key={m.user_id || i} className="flex items-center gap-2 text-xs">
                      <span className="relative flex-shrink-0">
                        <Circle className="w-2 h-2 text-[#10B981] fill-[#10B981]" />
                      </span>
                      <span className="text-[#F4F4F5] font-medium truncate">{m.name || m.username}</span>
                    </div>
                  ))}
                  {onlineMembers.length > 3 && (
                    <span className="text-[10px] text-[#6B7280]">+{onlineMembers.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {/* Switch to squad mode handled by parent */}}
            className="w-full py-2.5 bg-[#18181B] hover:bg-[#252D3B] text-[#F4F4F5] border border-[#27272A] hover:border-[#EA5D3A]/50 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A]"
          >
            <span>View Squad Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#EA5D3A]" aria-hidden="true" />
          </button>
        </motion.article>
      </div>

      {/* Frictionless Micro-Warmup Modal */}
      <AnimatePresence>
        {showWarmupModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#09090B]/80 backdrop-blur-sm z-50"
              onClick={() => setShowWarmupModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="warmup-title"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[80vh] bg-[#09090B] border border-[#27272A] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-[#222225] bg-[#121215]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#EA5D3A]/20 rounded-lg">
                    <Zap className="w-5 h-5 text-[#EA5D3A]" />
                  </div>
                  <div>
                    <h3 id="warmup-title" className="text-lg font-bold text-white">Daily 3-Min Warmup</h3>
                    <p className="text-xs text-[#9CA3AF]">Two Sum (Easy) • Locks in {userStreak}-day streak</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWarmupModal(false)}
                  className="text-[#6B7280] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#18181B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
                {/* Problem Description */}
                <div className="p-6 border-r border-[#222225] bg-[#09090B] overflow-y-auto">
                  <h4 className="text-xl font-bold text-[#F4F4F5] mb-4">1. Two Sum</h4>
                  <div className="space-y-4 text-sm text-[#9CA3AF]">
                    <p>Given an array of integers <code className="bg-[#18181B] px-1.5 py-0.5 rounded text-[#F4F4F5]">nums</code> and an integer <code className="bg-[#18181B] px-1.5 py-0.5 rounded text-[#F4F4F5]">target</code>, return indices of the two numbers such that they add up to <code className="bg-[#18181B] px-1.5 py-0.5 rounded text-[#F4F4F5]">target</code>.</p>
                    <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                    <div className="bg-[#121215] border border-[#27272A] p-4 rounded-lg font-mono text-xs text-[#E6EDF3]">
                      <p><strong className="text-white">Input:</strong> nums = [2,7,11,15], target = 9</p>
                      <p><strong className="text-white">Output:</strong> [0,1]</p>
                      <p><strong className="text-white">Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</p>
                    </div>
                  </div>
                </div>

                {/* Code Editor Mock */}
                <div className="flex flex-col bg-[#09090B]">
                  <div className="p-2 bg-[#121215] border-b border-[#222225] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#9CA3AF] flex items-center gap-2">
                      <Code className="w-4 h-4" /> JavaScript
                    </span>
                  </div>
                  <textarea
                    value={warmupCode}
                    onChange={(e) => setWarmupCode(e.target.value)}
                    className="flex-1 w-full bg-transparent p-4 text-sm font-mono text-[#E6EDF3] outline-none resize-none scrollbar-thin scrollbar-thumb-[#27272A]"
                    spellCheck={false}
                  />
                  <div className="p-4 border-t border-[#222225] bg-[#121215] flex justify-end">
                    <button
                      onClick={() => {
                        alert("Warmup completed! +50 XP and Streak locked.");
                        setShowWarmupModal(false);
                      }}
                      className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Warmup
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TodayHabitHub;
