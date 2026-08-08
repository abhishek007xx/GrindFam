import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Flame, Edit3, X, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { companiesData } from '../lib/dataFallback';
import CalendarDatePickerModal from './CalendarDatePickerModal';

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
    <div className="dash-card relative overflow-hidden bg-[#1E1E1E] border border-[#333333] rounded-2xl p-5 hover:border-zinc-500 transition-all shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-slate-100 border border-zinc-800 dark:border-zinc-800 light:border-slate-200 text-[#EA5D3A] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-slate-100 border border-zinc-800 dark:border-zinc-800 light:border-slate-200 px-2.5 py-0.5 rounded-full">
                Target Countdown
              </span>
              {savedSuccess && (
                <span className="text-[10px] text-[#10B981] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved!
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-zinc-100 dark:text-zinc-100 light:text-slate-900 tracking-tight mt-0.5">
              {targetCompany} <span className="text-xs font-normal text-zinc-400 dark:text-zinc-400 light:text-slate-500">({targetRole})</span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1.5 rounded-xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-slate-100 hover:bg-zinc-800 text-zinc-400 dark:text-zinc-400 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 text-xs font-medium flex items-center gap-1.5 border border-zinc-800 dark:border-zinc-800 light:border-slate-200 transition-all"
        >
          {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          <span>{isEditing ? 'Close' : 'Configure Goal'}</span>
        </button>
      </div>

      {/* Editing Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-slate-100 border border-zinc-800 dark:border-zinc-800 light:border-slate-200 space-y-3 relative z-20"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 mb-1">Target Company</label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full py-2 px-3 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-300 rounded-lg text-xs text-zinc-100 dark:text-zinc-100 light:text-slate-900 focus:outline-none focus:border-[#EA5D3A]"
                >
                  {companiesData.map(c => (
                    <option key={c.slug} value={c.company_name}>{c.company_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 mb-1">Role Level Track</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full py-2 px-3 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-300 rounded-lg text-xs text-zinc-100 dark:text-zinc-100 light:text-slate-900 focus:outline-none focus:border-[#EA5D3A]"
                >
                  <option value="Intern">Intern Track (OA + Fundamentals)</option>
                  <option value="Campus Placement">Campus Placement (3-Month Sprint)</option>
                  <option value="Senior Level">Senior Level (System Design)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 mb-1">Target Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full py-2 px-3 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-300 rounded-lg text-xs text-zinc-100 dark:text-zinc-100 light:text-slate-900 focus:outline-none focus:border-[#EA5D3A]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#EA5D3A] hover:bg-[#F2704E] text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
              >
                Save Goal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Codolio Stat Grid & Cards Cleanup (Clean Typography Days Left) */}
      <div className="bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-slate-100/90 border border-zinc-800/80 dark:border-zinc-800/80 light:border-slate-200 rounded-xl p-4 mb-4 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Clean Typography Days Left */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white dark:text-white light:text-slate-900 font-mono">{daysLeft}</span>
          <span className="text-xs text-zinc-400 dark:text-zinc-400 light:text-slate-600 uppercase tracking-wider font-medium">Days Left</span>
        </div>

        {/* Secondary Progress Metrics */}
        <div className="flex items-center gap-4 text-xs border-t sm:border-t-0 sm:border-l border-zinc-800 dark:border-zinc-800 light:border-slate-200 pt-3 sm:pt-0 sm:pl-4">
          <div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-slate-600 block font-medium">Required Pace</span>
            <span className="font-semibold text-zinc-200 dark:text-zinc-200 light:text-slate-900 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 light:text-slate-600" /> {dailyQuota} problems / day
            </span>
          </div>

          <div className="h-6 w-px bg-zinc-800 dark:bg-zinc-800 light:bg-slate-200 hidden sm:block" />

          <div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-slate-600 block font-medium">Unsolved Target</span>
            <span className="font-mono font-semibold text-zinc-200 dark:text-zinc-200 light:text-slate-900">{remainingProblems} left</span>
          </div>

          <div className="h-6 w-px bg-zinc-800 dark:bg-zinc-800 light:bg-slate-200 hidden sm:block" />

          <div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-slate-600 block font-medium">Track Progress</span>
            <span className="font-mono font-semibold text-[#10B981]">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Emerald Green Progress Bar */}
      <div className="relative z-10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 dark:text-zinc-400 light:text-slate-500">
          <span>
            {remainingProblems === 0
              ? 'All target problems solved!'
              : `Solve ${dailyQuota} problem${dailyQuota > 1 ? 's' : ''} daily to hit your ${targetCompany} goal on schedule`
            }
          </span>
          <span className="font-mono font-semibold text-[#10B981]">{solvedCount} / {totalTrackProblems} Solved</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-900 dark:bg-zinc-900 light:bg-slate-200 rounded-full overflow-hidden border border-zinc-800 dark:border-zinc-800 light:border-slate-300">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <CalendarDatePickerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={interviewDate}
        onSelectDate={(newDate) => {
          setInterviewDate(newDate);
          try {
            const payload = { company: targetCompany, role: targetRole, date: newDate, updatedAt: new Date().toISOString() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
          } catch (_) {}
        }}
      />
    </div>
  );
}
