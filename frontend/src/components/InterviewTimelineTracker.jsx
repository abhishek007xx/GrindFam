import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Flame, Edit3, X } from 'lucide-react';
import { companiesData } from '../lib/dataFallback';

const STORAGE_KEY = 'grindfam_interview_target';

export default function InterviewTimelineTracker({ totalTrackProblems = 50, solvedCount = 0, companyName = null }) {
  const [targetCompany, setTargetCompany] = useState(companyName || 'Google');
  const [targetRole, setTargetRole] = useState('Campus Placement');
  const [interviewDate, setInterviewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.company) setTargetCompany(parsed.company);
        if (parsed.role) setTargetRole(parsed.role);
        if (parsed.date) setInterviewDate(parsed.date);
      }
    } catch (e) {
      console.warn('Failed to parse interview target from localStorage', e);
    }
  }, []);

  useEffect(() => {
    if (companyName) setTargetCompany(companyName);
  }, [companyName]);

  const handleSave = () => {
    try {
      const payload = {
        company: targetCompany,
        role: targetRole,
        date: interviewDate,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save interview target', e);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDt = new Date(interviewDate);
  targetDt.setHours(0, 0, 0, 0);

  const diffTime = targetDt.getTime() - today.getTime();
  const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const remainingProblems = Math.max(0, totalTrackProblems - solvedCount);
  const dailyQuota = Math.max(1, Math.ceil(remainingProblems / daysLeft));
  const progressPercent = Math.min(100, Math.round((solvedCount / Math.max(1, totalTrackProblems)) * 100));

  return (
    <div className="bg-[#121212] border border-white/[0.08] rounded-lg p-5 relative overflow-hidden">
      {/* Brand Fox Mascot Watermark Background (Bottom-right corner) */}
      <img
        src="/logo.png"
        alt="GrindFam Fox"
        className="absolute -bottom-6 -right-6 w-36 h-36 object-contain opacity-[0.06] grayscale pointer-events-none select-none"
      />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#EA5D3A] uppercase tracking-tight bg-[#EA5D3A]/10 border border-[#EA5D3A]/20 px-2 py-0.5 rounded-full">
                Target Countdown
              </span>
              {savedSuccess && (
                <span className="text-[10px] text-[#EA5D3A] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved!
                </span>
              )}
            </div>
            <h2 className="text-base font-black text-white uppercase tracking-tight mt-0.5">
              {targetCompany} <span className="text-xs font-normal text-[#8b949e] font-sans lowercase">({targetRole})</span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1.5 rounded-md bg-[#181818] hover:bg-[#202020] text-[#8b949e] hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all"
        >
          {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          <span>{isEditing ? 'Close' : 'Configure'}</span>
        </button>
      </div>

      {/* Editing Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#8b949e] uppercase tracking-tight mb-1">Target Company</label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-white focus:outline-none focus:border-[#EA5D3A]"
                >
                  {companiesData.map(c => (
                    <option key={c.slug} value={c.company_name}>{c.company_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8b949e] uppercase tracking-tight mb-1">Role Level Track</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-white focus:outline-none focus:border-[#EA5D3A]"
                >
                  <option value="Intern">🎓 Intern Track (OA + Fundamentals)</option>
                  <option value="Campus Placement">🚀 Campus Placement (3-Month Sprint)</option>
                  <option value="Senior Level">💼 Lateral / Senior Level (System Design)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8b949e] uppercase tracking-tight mb-1">Target Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-white focus:outline-none focus:border-[#EA5D3A]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] hover:from-[#D84C2A] hover:to-[#EA5D3A] text-white text-xs font-bold rounded-md transition-all shadow-md shadow-[#EA5D3A]/20"
              >
                Save Goal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Integrated Asymmetrical Stat Bar (Hierarchy focus instead of 4 equal KPI boxes) */}
      <div className="bg-[#181818] border border-white/10 rounded-lg p-4 mb-4 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Dominant Main Stat: Days Left & Daily Quota */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-[#EA5D3A] font-mono tracking-tight">{daysLeft}</span>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-tight">Days Remaining</p>
            <p className="text-[11px] text-[#8b949e]">Target date: {new Date(interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Secondary Stats: Inline Meta Group */}
        <div className="flex items-center gap-4 text-xs border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4">
          <div>
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-tight block">Required Pace</span>
            <span className="font-extrabold text-white flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#EA5D3A]" /> {dailyQuota} problems / day
            </span>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div>
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-tight block">Unsolved Target</span>
            <span className="font-mono font-bold text-white">{remainingProblems} left</span>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div>
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-tight block">Track Progress</span>
            <span className="font-mono font-bold text-[#EA5D3A]">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Integrated Timeline Progress Track */}
      <div className="relative z-10 space-y-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-[#8b949e]">
          <span>
            {remainingProblems === 0
              ? '🎉 All target problems solved!'
              : `Solve ${dailyQuota} problem${dailyQuota > 1 ? 's' : ''} daily to hit your ${targetCompany} goal on schedule`
            }
          </span>
          <span className="font-mono font-bold text-white">{solvedCount} / {totalTrackProblems} Solved</span>
        </div>
        <div className="h-1.5 w-full bg-[#181818] rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
