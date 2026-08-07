import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Target, Sparkles, Building2,
  CheckCircle2, Flame, Edit3, X, Zap
} from 'lucide-react';
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
    <div className="dash-card p-5 bg-[#121212] border border-white/[0.08] rounded-xl relative overflow-hidden">
      {/* Subtle corner radial glow in brand orange only */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_100%_0%,rgba(234,93,58,0.08),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#EA5D3A] uppercase tracking-widest bg-[#EA5D3A]/10 border border-[#EA5D3A]/20 px-2 py-0.5 rounded-md">
                Interview Target
              </span>
              {savedSuccess && (
                <span className="text-[10px] text-[#EA5D3A] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved!
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">
              Target: {targetCompany} <span className="text-xs font-semibold text-[#8b949e] font-sans">({targetRole})</span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#202020] text-[#8b949e] hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all"
        >
          {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          <span>{isEditing ? 'Close' : 'Configure Target'}</span>
        </button>
      </div>

      {/* Editing Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">Target Company</label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-white focus:outline-none focus:border-[#EA5D3A]"
                >
                  {companiesData.map(c => (
                    <option key={c.slug} value={c.company_name}>{c.company_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">Role Level Track</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-white focus:outline-none focus:border-[#EA5D3A]"
                >
                  <option value="Intern">🎓 Intern Track (OA + Fundamentals)</option>
                  <option value="Campus Placement">🚀 Campus Placement (3-Month Sprint)</option>
                  <option value="Senior Level">💼 Lateral / Senior Level (System Design)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">Target Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-white focus:outline-none focus:border-[#EA5D3A]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] hover:from-[#D84C2A] hover:to-[#EA5D3A] text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-[#EA5D3A]/20"
              >
                Save Target
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Stat Row with Clean Dividers (No 4 separate colored boxes!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#21262d] bg-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden mb-5">
        {/* Stat 1: Days Remaining (Neutral) */}
        <div className="p-3.5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-[#6e7681] flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-[#6e7681] uppercase tracking-wider">Days Left</p>
            <p className="text-base font-extrabold text-white leading-tight">{daysLeft} <span className="text-[11px] font-medium text-[#6e7681]">days</span></p>
          </div>
        </div>

        {/* Stat 2: Unsolved Target (Neutral) */}
        <div className="p-3.5 flex items-center gap-3">
          <Building2 className="w-4 h-4 text-[#6e7681] flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-[#6e7681] uppercase tracking-wider">Unsolved</p>
            <p className="text-base font-extrabold text-white leading-tight">{remainingProblems} <span className="text-[11px] font-medium text-[#6e7681]">problems</span></p>
          </div>
        </div>

        {/* Stat 3: Daily Target Quota (Emphasized Brand Accent) */}
        <div className="p-3.5 flex items-center gap-3 bg-[#EA5D3A]/[0.06]">
          <div className="w-7 h-7 rounded-md bg-[#EA5D3A]/15 text-[#EA5D3A] flex items-center justify-center flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-[#EA5D3A] uppercase tracking-wider">Daily Quota</p>
            <p className="text-base font-black text-white leading-tight">{dailyQuota} <span className="text-[11px] font-bold text-[#EA5D3A]">/ day</span></p>
          </div>
        </div>

        {/* Stat 4: Overall Progress (Neutral) */}
        <div className="p-3.5 flex items-center gap-3">
          <Zap className="w-4 h-4 text-[#6e7681] flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-[#6e7681] uppercase tracking-wider">Progress</p>
            <p className="text-base font-extrabold text-white leading-tight">{progressPercent}% <span className="text-[11px] font-medium text-[#6e7681]">done</span></p>
          </div>
        </div>
      </div>

      {/* Progress Bar & Status Banner */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-[#8b949e] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#EA5D3A]" />
            {remainingProblems === 0
              ? '🎉 All target problems solved! You are 100% interview ready!'
              : `Solve ${dailyQuota} problem${dailyQuota > 1 ? 's' : ''} daily to complete your target by ${new Date(interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            }
          </span>
          <span className="font-mono font-bold text-[#EA5D3A]">{solvedCount} / {totalTrackProblems} Solved</span>
        </div>
        <div className="progress-track h-2 bg-[#0d1117] rounded-full overflow-hidden border border-[#21262d]">
          <div
            className="progress-fill h-full bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
