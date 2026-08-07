import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Target, Award, Sparkles, Building2,
  AlertCircle, CheckCircle2, Flame, ArrowRight, Zap, RefreshCw, ChevronRight, Edit3, X
} from 'lucide-react';
import { companiesData } from '../lib/dataFallback';

const STORAGE_KEY = 'grindfam_interview_target';

export default function InterviewTimelineTracker({ totalTrackProblems = 50, solvedCount = 0, companyName = null }) {
  const [targetCompany, setTargetCompany] = useState(companyName || 'Google');
  const [targetRole, setTargetRole] = useState('Campus Placement'); // 'Intern', 'Campus Placement', 'Senior Level'
  const [interviewDate, setInterviewDate] = useState(() => {
    // Default target date: 30 days from today
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load saved goal from localStorage
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

  // Sync if prop companyName changes
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

  // Calculations
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
    <div className="dash-card p-6 bg-gradient-to-br from-[#161b22] via-[#1c2128] to-[#0d1117] border border-[#30363d] rounded-2xl shadow-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#CC785C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#CC785C]/15 border border-[#CC785C]/30 text-[#CC785C]">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#CC785C] uppercase tracking-widest bg-[#CC785C]/10 border border-[#CC785C]/20 px-2 py-0.5 rounded-full">
                Interview Timeline Tracker
              </span>
              {savedSuccess && (
                <span className="text-[10px] text-[#CC785C] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved!
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5 flex items-center gap-2">
              Target: <span className="text-white font-bold">{targetCompany}</span> ({targetRole})
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3.5 py-2 rounded-xl bg-transparent hover:bg-white/5 text-[#8b949e] hover:text-[#CC785C] text-xs font-semibold flex items-center gap-1.5 border border-[#30363d] hover:border-[#CC785C] transition-all"
        >
          {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-[#CC785C]" />}
          <span>{isEditing ? 'Close Settings' : 'Configure Target'}</span>
        </button>
      </div>

      {/* Editing Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1.5">Target Company</label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full py-2 px-3 bg-[#161b22] border border-[#30363d] rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#CC785C]"
                >
                  {companiesData.map(c => (
                    <option key={c.slug} value={c.company_name}>{c.company_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1.5">Role Level Track</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full py-2 px-3 bg-[#161b22] border border-[#30363d] rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#CC785C]"
                >
                  <option value="Intern">🎓 Intern Track (OA + Fundamentals)</option>
                  <option value="Campus Placement">🚀 Campus Placement (3-Month Sprint)</option>
                  <option value="Senior Level">💼 Lateral / Senior Level (System Design)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1.5">Target Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full py-2 px-3 bg-[#161b22] border border-[#30363d] rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#CC785C]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-gradient-to-r from-[#CC785C] to-[#DA7756] hover:from-[#B85C3E] hover:to-[#CC785C] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#CC785C]/20"
              >
                Save Timeline Target
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Days Left */}
        <div className="p-4 rounded-xl bg-[#0d1117]/80 border border-[#30363d] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">Days Remaining</p>
            <p className="text-xl font-black text-white">{daysLeft} <span className="text-xs font-normal text-[#8b949e]">days</span></p>
          </div>
        </div>

        {/* Metric 2: Problems Left */}
        <div className="p-4 rounded-xl bg-[#0d1117]/80 border border-[#30363d] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">Unsolved Target</p>
            <p className="text-xl font-black text-white">{remainingProblems} <span className="text-xs font-normal text-[#8b949e]">problems</span></p>
          </div>
        </div>

        {/* Metric 3: Daily Quota (CALCULATED FEATURE) */}
        <div className="p-4 rounded-xl bg-[#0d1117]/80 border border-[#CC785C]/30 flex items-center gap-3 relative overflow-hidden bg-gradient-to-r from-[#CC785C]/10 to-transparent">
          <div className="p-2.5 rounded-xl bg-[#CC785C]/20 text-[#CC785C] border border-[#CC785C]/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#CC785C] uppercase tracking-wider">Daily Target Quota</p>
            <p className="text-xl font-black text-white">{dailyQuota} <span className="text-xs font-semibold text-[#CC785C]">/ day</span></p>
          </div>
        </div>

        {/* Metric 4: Target Progress */}
        <div className="p-4 rounded-xl bg-[#0d1117]/80 border border-[#30363d] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">Overall Progress</p>
            <p className="text-xl font-black text-white">{progressPercent}% <span className="text-xs font-normal text-[#8b949e]">done</span></p>
          </div>
        </div>
      </div>

      {/* Progress Bar & Status Banner */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#CC785C]" />
            {remainingProblems === 0
              ? '🎉 All target problems solved! You are 100% interview ready!'
              : `Solve ${dailyQuota} problem${dailyQuota > 1 ? 's' : ''} daily to complete your ${targetCompany} target by ${new Date(interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            }
          </span>
          <span className="font-mono font-bold text-[#CC785C]">{solvedCount} / {totalTrackProblems} Solved</span>
        </div>
        <div className="progress-track h-2 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
          <div
            className="progress-fill h-full bg-gradient-to-r from-[#CC785C] to-[#DA7756] transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
