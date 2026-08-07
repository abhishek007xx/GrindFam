import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Target, Code2, Calendar, CheckCircle2, AlertCircle, Loader2,
  RefreshCw, FileSpreadsheet, FileJson, Printer, Trash2, ShieldAlert,
  Moon, Sun, Laptop, Palette, Bell, Lock, Globe, Users, Shield, Zap,
  Check, ArrowRight, Upload, Sparkles, Sliders, KeyRound, Building2,
  Clock, Flame, HelpCircle
} from 'lucide-react';

const COMPANIES = [
  'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix',
  'Uber', 'Stripe', 'Nvidia', 'OpenAI', 'Airbnb', 'Custom'
];

const ROLES = [
  'SDE Backend', 'SDE Frontend', 'SDE Fullstack', 'Data Engineer',
  'ML Engineer', 'Mobile Engineer', 'DevOps / Cloud', 'Engineering Manager'
];

const LEVELS = [
  'Intern', 'Campus / Entry-Level (L3)', 'Mid-Level (L4)', 'Senior Engineer (L5)', 'Staff Engineer+ (L6+)'
];

const LANGUAGES = ['C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'C#'];

const ACCENT_COLORS = [
  { id: 'orange', name: 'Grind Orange', hex: '#EA5D3A', bgClass: 'bg-[#EA5D3A]' },
  { id: 'emerald', name: 'Terminal Emerald', hex: '#22C55E', bgClass: 'bg-[#22C55E]' },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#06B6D4', bgClass: 'bg-[#06B6D4]' },
  { id: 'violet', name: 'Electric Violet', hex: '#8B5CF6', bgClass: 'bg-[#8B5CF6]' },
  { id: 'rose', name: 'Neon Rose', hex: '#F43F5E', bgClass: 'bg-[#F43F5E]' }
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, updatePassword } = useAuth();
  const {
    settings,
    updateSettings,
    lcStats,
    verifyingLc,
    syncingLc,
    verifyLeetcode,
    syncLeetcodeNow,
    exportPDF,
    exportCSV,
    exportJSON,
    resetAllProgress,
    deleteAccount
  } = useSettings();

  const [activeTab, setActiveTab] = useState('profile');

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // LeetCode Verify message state
  const [verifyError, setVerifyError] = useState(null);
  const [verifySuccess, setVerifySuccess] = useState(null);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState(null);

  // Danger Zone Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Days until interview calculation
  const daysUntilInterview = (() => {
    if (!settings.targetInterviewDate) return null;
    const target = new Date(settings.targetInterviewDate);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  })();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyHandle = async () => {
    setVerifyError(null);
    setVerifySuccess(null);
    try {
      const stats = await verifyLeetcode(settings.leetcodeUsername);
      setVerifySuccess(`Verified: ${stats.totalSolved} solved (${stats.easySolved}E, ${stats.mediumSolved}M, ${stats.hardSolved}H) | Rank: ${stats.ranking}`);
      showToast('LeetCode handle verified successfully!');
    } catch (err) {
      setVerifyError(err.message || 'Failed to verify LeetCode username.');
    }
  };

  const handleSyncNow = async () => {
    try {
      await syncLeetcodeNow();
      showToast('LeetCode stats synced!');
    } catch (err) {
      showToast('Sync failed.');
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ avatarUrl: reader.result });
        showToast('Avatar updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmReset = async () => {
    if (resetConfirmInput.trim().toUpperCase() !== 'RESET') return;
    await resetAllProgress();
    setShowResetModal(false);
    setResetConfirmInput('');
    showToast('All progress has been reset.');
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmInput.trim().toUpperCase() !== 'DELETE') return;
    setShowDeleteModal(false);
    await deleteAccount();
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Target', icon: User },
    { id: 'grind', label: 'Grind Preferences', icon: Target },
    { id: 'leetcode', label: 'LeetCode Sync', icon: Code2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'data', label: 'Data & Danger Zone', icon: ShieldAlert }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-[#EA5D3A]">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white dark:text-white light:text-slate-900">Settings & Preferences</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                Auto-saved
              </span>
            </div>
            <p className="text-xs text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500 mt-0.5">
              Customize your profile, target goals, grind pacing, notifications, theme, privacy, and data backup.
            </p>
          </div>
        </div>

        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </div>

      {/* Main Tab Navigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1.5 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-3 rounded-2xl shadow-xl h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#EA5D3A] text-white font-bold shadow-md shadow-[#EA5D3A]/20'
                    : 'text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 hover:bg-[#141414] dark:hover:bg-[#141414] light:hover:bg-slate-100 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#737373]'}`} />
                  <span>{tab.label}</span>
                </div>
                {isActive && <ArrowRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {/* TAB 1: PROFILE & TARGET */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Card: Profile Identity */}
                  <div className="dash-card bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">Profile Identity</h2>
                        <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">Edit your display name, avatar, and LeetCode handle</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* Avatar Upload */}
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200">
                        <div className="relative">
                          {settings.avatarUrl ? (
                            <img src={settings.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-[#EA5D3A]" />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-[#EA5D3A]/15 border-2 border-[#EA5D3A] flex items-center justify-center text-xl font-black text-[#EA5D3A]">
                              {(settings.name || 'G').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white dark:text-white light:text-slate-900 mb-1">Profile Avatar</p>
                          <p className="text-[11px] text-[#737373] dark:text-[#737373] light:text-slate-500 mb-2">Upload a custom image or use initials</p>
                          <div className="flex items-center gap-2">
                            <label className="px-3 py-1.5 bg-[#2C2C2C] dark:bg-[#2C2C2C] light:bg-slate-200 hover:bg-[#333333] text-white dark:text-white light:text-slate-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Image</span>
                              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                            </label>
                            {settings.avatarUrl && (
                              <button
                                onClick={() => { updateSettings({ avatarUrl: '' }); showToast('Avatar cleared.'); }}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Display Name */}
                      <div>
                        <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-1.5">
                          Full Display Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                          <input
                            type="text"
                            value={settings.name}
                            onChange={(e) => updateSettings({ name: e.target.value })}
                            placeholder="Enter your name"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white dark:text-white light:text-slate-900 text-sm focus:outline-none focus:border-[#EA5D3A]"
                          />
                        </div>
                      </div>

                      {/* LeetCode Username + Verify */}
                      <div>
                        <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-1.5">
                          LeetCode Username Handle
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="relative flex-1">
                            <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EA5D3A]" />
                            <input
                              type="text"
                              value={settings.leetcodeUsername}
                              onChange={(e) => updateSettings({ leetcodeUsername: e.target.value })}
                              placeholder="e.g. Abhishek_jb007"
                              className="w-full pl-10 pr-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white dark:text-white light:text-slate-900 font-mono text-sm focus:outline-none focus:border-[#EA5D3A]"
                            />
                          </div>
                          <button
                            onClick={handleVerifyHandle}
                            disabled={verifyingLc}
                            className="px-4 py-2.5 bg-[#EA5D3A] hover:bg-[#F2704E] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 flex-shrink-0"
                          >
                            {verifyingLc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>{verifyingLc ? 'Verifying...' : 'Verify Handle'}</span>
                          </button>
                        </div>

                        {verifySuccess && (
                          <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>{verifySuccess}</span>
                          </div>
                        )}

                        {verifyError && (
                          <div className="mt-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{verifyError}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card: Target Interview Goals */}
                  <div className="dash-card bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">Target Interview Goals</h2>
                        <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">Configure your dream company, role, level, and interview date</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Target Company */}
                      <div>
                        <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-1.5">
                          Target Company
                        </label>
                        <select
                          value={settings.targetCompany}
                          onChange={(e) => updateSettings({ targetCompany: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white dark:text-white light:text-slate-900 text-sm focus:outline-none focus:border-[#EA5D3A]"
                        >
                          {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      {/* Target Role */}
                      <div>
                        <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-1.5">
                          Target Role
                        </label>
                        <select
                          value={settings.targetRole}
                          onChange={(e) => updateSettings({ targetRole: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white dark:text-white light:text-slate-900 text-sm focus:outline-none focus:border-[#EA5D3A]"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>

                      {/* Target Level */}
                      <div>
                        <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-1.5">
                          Target Level
                        </label>
                        <select
                          value={settings.targetLevel}
                          onChange={(e) => updateSettings({ targetLevel: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white dark:text-white light:text-slate-900 text-sm focus:outline-none focus:border-[#EA5D3A]"
                        >
                          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>

                      {/* Target Interview Date */}
                      <div>
                        <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-1.5">
                          Target Interview Date
                        </label>
                        <input
                          type="date"
                          value={settings.targetInterviewDate}
                          onChange={(e) => updateSettings({ targetInterviewDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white dark:text-white light:text-slate-900 text-sm focus:outline-none focus:border-[#EA5D3A]"
                        />
                      </div>
                    </div>

                    {/* Interview Target Countdown Banner */}
                    {daysUntilInterview !== null && (
                      <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-[#EA5D3A]/15 to-amber-500/15 border border-[#EA5D3A]/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-[#EA5D3A] text-white">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 font-medium">Interview Sprint</p>
                            <p className="text-sm font-extrabold text-white dark:text-white light:text-slate-900">
                              {settings.targetRole} @ {settings.targetCompany} ({settings.targetLevel})
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-black text-[#EA5D3A] font-mono">
                            {daysUntilInterview > 0 ? `${daysUntilInterview} Days Left` : daysUntilInterview === 0 ? 'Today!' : 'Passed'}
                          </p>
                          <p className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold">Countdown</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GRIND PREFERENCES */}
              {activeTab === 'grind' && (
                <div className="dash-card bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">Grind Pacing & Preferences</h2>
                      <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">Configure problem targets, coding language, timers, and spaced repetition</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Daily Target */}
                    <div>
                      <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-2">
                        Daily Target (Problems / Day)
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {[1, 2, 3, 5, 8, 10].map((num) => (
                          <button
                            key={num}
                            onClick={() => updateSettings({ dailyTarget: num })}
                            className={`py-3 px-2 rounded-xl font-bold text-xs transition-all border ${
                              settings.dailyTarget === num
                                ? 'bg-[#EA5D3A] text-white border-[#EA5D3A] shadow-md shadow-[#EA5D3A]/20'
                                : 'bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border-[#333333] dark:border-[#333333] light:border-slate-200 text-[#A3A3A3] hover:text-white'
                            }`}
                          >
                            {num} / day
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Default Coding Language */}
                    <div>
                      <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-2">
                        Default Language
                      </label>
                      <select
                        value={settings.defaultLanguage}
                        onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white dark:text-white light:text-slate-900 text-sm focus:outline-none focus:border-[#EA5D3A]"
                      >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                      </select>
                    </div>

                    {/* Auto-start Timer on Problem Open */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Auto-start Timer on Problem Open</p>
                        <p className="text-[11px] text-[#737373] dark:text-[#737373] light:text-slate-500">Automatically begin countdown when opening problem details</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ autoStartTimer: !settings.autoStartTimer })}
                        className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                          settings.autoStartTimer ? 'bg-[#EA5D3A]' : 'bg-[#333333]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.autoStartTimer ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Timer Duration */}
                    <div>
                      <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-2">
                        Timer Duration
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {[15, 20, 30, 45, 60].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => updateSettings({ timerDuration: mins })}
                            className={`py-2.5 px-2 rounded-xl font-bold text-xs transition-all border ${
                              settings.timerDuration === mins
                                ? 'bg-[#EA5D3A] text-white border-[#EA5D3A]'
                                : 'bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border-[#333333] dark:border-[#333333] light:border-slate-200 text-[#A3A3A3] hover:text-white'
                            }`}
                          >
                            {mins} Min
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spaced Repetition Mode */}
                    <div>
                      <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-2">
                        Spaced Repetition Pacing Mode
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          onClick={() => updateSettings({ spacedRepetitionMode: 'Conservative' })}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            settings.spacedRepetitionMode === 'Conservative'
                              ? 'bg-[#141414] border-[#EA5D3A] ring-1 ring-[#EA5D3A]'
                              : 'bg-[#141414]/60 border-[#333333] hover:border-zinc-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-white">Conservative</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">1d, 3d, 7d, 14d, 30d</span>
                          </div>
                          <p className="text-[11px] text-[#A3A3A3]">Steady retention schedule designed for balanced study over months.</p>
                        </div>

                        <div
                          onClick={() => updateSettings({ spacedRepetitionMode: 'Aggressive' })}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            settings.spacedRepetitionMode === 'Aggressive'
                              ? 'bg-[#141414] border-[#EA5D3A] ring-1 ring-[#EA5D3A]'
                              : 'bg-[#141414]/60 border-[#333333] hover:border-zinc-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-white">Aggressive</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">1d, 2d, 4d, 7d, 14d</span>
                          </div>
                          <p className="text-[11px] text-[#A3A3A3]">Fast-paced rapid review intervals ideal for upcoming interview sprints.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LEETCODE SYNC */}
              {activeTab === 'leetcode' && (
                <div className="dash-card bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">LeetCode Sync Settings</h2>
                      <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">Manage real-time stats sync and auto-sync schedule</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Username Display & Edit */}
                    <div>
                      <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-1.5">
                        LeetCode Username
                      </label>
                      <input
                        type="text"
                        value={settings.leetcodeUsername}
                        onChange={(e) => updateSettings({ leetcodeUsername: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white dark:text-white light:text-slate-900 font-mono text-sm focus:outline-none focus:border-[#EA5D3A]"
                      />
                    </div>

                    {/* Sync Trigger Banner */}
                    <div className="p-5 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white dark:text-white light:text-slate-900">Live Sync Status</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-[11px] text-[#737373] dark:text-[#737373] light:text-slate-500 mt-1">
                          Last Synced: <span className="font-semibold text-zinc-300">{settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleString() : 'Not synced yet'}</span>
                        </p>
                      </div>

                      <button
                        onClick={handleSyncNow}
                        disabled={syncingLc}
                        className="px-5 py-2.5 bg-[#EA5D3A] hover:bg-[#F2704E] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncingLc ? 'animate-spin' : ''}`} />
                        <span>{syncingLc ? 'Syncing...' : 'Sync Now'}</span>
                      </button>
                    </div>

                    {/* Auto Sync Schedule Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Background Auto-Sync</p>
                        <p className="text-[11px] text-[#737373] dark:text-[#737373] light:text-slate-500">Automatically sync LeetCode stats every 6 hours</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ autoSync: settings.autoSync === 'every_6_hours' ? 'manual' : 'every_6_hours' })}
                        className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                          settings.autoSync === 'every_6_hours' ? 'bg-[#EA5D3A]' : 'bg-[#333333]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.autoSync === 'every_6_hours' ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="dash-card bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
                    <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">Notification Alerts</h2>
                      <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">Customize daily problem reminders and streak alerts</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Daily Reminder Time */}
                    <div className="p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Daily Reminder Time</p>
                        <p className="text-[11px] text-[#737373] dark:text-[#737373] light:text-slate-500">Select when to receive daily problem goal notifications</p>
                      </div>
                      <input
                        type="time"
                        value={settings.dailyReminderTime}
                        onChange={(e) => updateSettings({ dailyReminderTime: e.target.value })}
                        className="px-3 py-1.5 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-lg text-white dark:text-white light:text-slate-900 text-xs font-mono"
                      />
                    </div>

                    {/* Streak Danger Alert */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Streak Danger Alert</p>
                        <p className="text-[11px] text-[#737373] dark:text-[#737373] light:text-slate-500">Alert if daily target is not completed by reminder time</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ streakAlert: !settings.streakAlert })}
                        className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                          settings.streakAlert ? 'bg-[#EA5D3A]' : 'bg-[#333333]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.streakAlert ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Squad Activity Alerts */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Squad Activity Alerts</p>
                        <p className="text-[11px] text-[#737373] dark:text-[#737373] light:text-slate-500">Notifications on squad room updates and weekly challenges</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ squadAlerts: !settings.squadAlerts })}
                        className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                          settings.squadAlerts ? 'bg-[#EA5D3A]' : 'bg-[#333333]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.squadAlerts ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* DM Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Direct Message Notifications</p>
                        <p className="text-[11px] text-[#737373] dark:text-[#737373] light:text-slate-500">Receive alerts when friends send direct messages</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ dmNotifications: !settings.dmNotifications })}
                        className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                          settings.dmNotifications ? 'bg-[#EA5D3A]' : 'bg-[#333333]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.dmNotifications ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: APPEARANCE */}
              {activeTab === 'appearance' && (
                <div className="dash-card bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
                    <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">Appearance & Themes</h2>
                      <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">Customize visual themes, accent colors, and layout density</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Theme Mode */}
                    <div>
                      <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-2">
                        Theme Mode
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          onClick={() => updateSettings({ theme: 'dark' })}
                          className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                            settings.theme === 'dark'
                              ? 'bg-[#141414] border-[#EA5D3A] ring-1 ring-[#EA5D3A]'
                              : 'bg-[#141414]/60 border-[#333333] hover:border-zinc-500'
                          }`}
                        >
                          <Moon className="w-5 h-5 text-amber-400" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Dark Mode</p>
                            <p className="text-[10px] text-[#737373]">Deep charcoal palette</p>
                          </div>
                        </button>

                        <button
                          onClick={() => updateSettings({ theme: 'light' })}
                          className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                            settings.theme === 'light'
                              ? 'bg-[#141414] border-[#EA5D3A] ring-1 ring-[#EA5D3A]'
                              : 'bg-[#141414]/60 border-[#333333] hover:border-zinc-500'
                          }`}
                        >
                          <Sun className="w-5 h-5 text-amber-500" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Light Mode</p>
                            <p className="text-[10px] text-[#737373]">Clean crisp theme</p>
                          </div>
                        </button>

                        <button
                          onClick={() => updateSettings({ theme: 'auto' })}
                          className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                            settings.theme === 'auto'
                              ? 'bg-[#141414] border-[#EA5D3A] ring-1 ring-[#EA5D3A]'
                              : 'bg-[#141414]/60 border-[#333333] hover:border-zinc-500'
                          }`}
                        >
                          <Laptop className="w-5 h-5 text-indigo-400" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Auto (System)</p>
                            <p className="text-[10px] text-[#737373]">Sync with system OS</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Accent Color Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-2">
                        Accent Color Theme
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {ACCENT_COLORS.map((accent) => (
                          <button
                            key={accent.id}
                            onClick={() => updateSettings({ accentColor: accent.id })}
                            className={`p-3 rounded-xl border transition-all flex items-center gap-2.5 ${
                              settings.accentColor === accent.id
                                ? 'bg-[#141414] border-white ring-1 ring-white'
                                : 'bg-[#141414]/60 border-[#333333] hover:border-zinc-500'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full ${accent.bgClass}`} />
                            <span className="text-xs font-semibold text-white">{accent.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Compact Mode Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Compact Mode</p>
                        <p className="text-[11px] text-[#737373] dark:text-[#737373] light:text-slate-500">Reduce spacing and padding for high data density</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ compactMode: !settings.compactMode })}
                        className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                          settings.compactMode ? 'bg-[#EA5D3A]' : 'bg-[#333333]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.compactMode ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PRIVACY */}
              {activeTab === 'privacy' && (
                <div className="dash-card bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">Privacy & Visibility</h2>
                      <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">Control profile visibility, leaderboard presence, and direct messages</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Visibility */}
                    <div>
                      <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-2">
                        Profile Visibility
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'public', label: 'Public', desc: 'Anyone with your link can view' },
                          { id: 'friends_only', label: 'Friends Only', desc: 'Only added friends can view' },
                          { id: 'private', label: 'Private', desc: 'Only visible to you' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => updateSettings({ profileVisibility: item.id })}
                            className={`p-3.5 rounded-xl border text-left transition-all ${
                              settings.profileVisibility === item.id
                                ? 'bg-[#141414] border-[#EA5D3A] ring-1 ring-[#EA5D3A]'
                                : 'bg-[#141414]/60 border-[#333333] hover:border-zinc-500'
                            }`}
                          >
                            <p className="text-xs font-bold text-white">{item.label}</p>
                            <p className="text-[10px] text-[#737373] mt-0.5">{item.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Show on Global Leaderboard */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Show on Global Leaderboard</p>
                        <p className="text-[11px] text-[#737373] dark:text-[#737373] light:text-slate-500">Include your solve count and ranking on community leaderboards</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ showOnLeaderboard: !settings.showOnLeaderboard })}
                        className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                          settings.showOnLeaderboard ? 'bg-[#EA5D3A]' : 'bg-[#333333]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.showOnLeaderboard ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Allow DMs From */}
                    <div>
                      <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-2">
                        Allow Direct Messages From
                      </label>
                      <select
                        value={settings.allowDMsFrom}
                        onChange={(e) => updateSettings({ allowDMsFrom: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white dark:text-white light:text-slate-900 text-sm focus:outline-none focus:border-[#EA5D3A]"
                      >
                        <option value="everyone">Everyone</option>
                        <option value="squad_only">Squad Members Only</option>
                        <option value="nobody">Nobody</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: DATA & DANGER ZONE */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  {/* Card: Export Progress Data */}
                  <div className="dash-card bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">Export Progress & Data</h2>
                        <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">Download your problem tracking stats as PDF, CSV, or JSON</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* PDF Report Export */}
                      <button
                        onClick={exportPDF}
                        className="p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 hover:border-[#EA5D3A] transition-all flex flex-col items-center justify-center text-center group"
                      >
                        <div className="p-3 rounded-xl bg-[#EA5D3A]/10 text-[#EA5D3A] mb-2 group-hover:scale-110 transition-transform">
                          <Printer className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Export as PDF</p>
                        <p className="text-[10px] text-[#737373] mt-0.5">Printable progress report</p>
                      </button>

                      {/* CSV Export */}
                      <button
                        onClick={exportCSV}
                        className="p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 hover:border-emerald-500 transition-all flex flex-col items-center justify-center text-center group"
                      >
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Export as CSV</p>
                        <p className="text-[10px] text-[#737373] mt-0.5">Spreadsheet data format</p>
                      </button>

                      {/* JSON Export */}
                      <button
                        onClick={exportJSON}
                        className="p-4 rounded-xl bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 hover:border-indigo-500 transition-all flex flex-col items-center justify-center text-center group"
                      >
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                          <FileJson className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">Export as JSON</p>
                        <p className="text-[10px] text-[#737373] mt-0.5">Full backup data structure</p>
                      </button>
                    </div>
                  </div>

                  {/* Card: Change Password */}
                  <div className="dash-card bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">Security & Password</h2>
                        <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">Update your account authentication password</p>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Password updated successfully!</span>
                      </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-1.5">
                            New Password
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full px-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white text-sm focus:outline-none focus:border-[#EA5D3A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-600 uppercase tracking-wider mb-1.5">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full px-4 py-2.5 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-white text-sm focus:outline-none focus:border-[#EA5D3A]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-5 py-2.5 bg-[#EA5D3A] hover:bg-[#F2704E] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                        <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Card: Danger Zone */}
                  <div className="dash-card bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-rose-500/30 p-6 rounded-2xl shadow-xl space-y-4">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-[#2C2C2C]">
                      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-rose-400">Danger Zone</h2>
                        <p className="text-[11px] text-[#A3A3A3]">Irreversible actions on your account and data</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Reset Progress Button */}
                      <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col justify-between space-y-3">
                        <div>
                          <p className="text-xs font-bold text-white">Reset All Progress</p>
                          <p className="text-[11px] text-[#737373] mt-1">Clear all solved problem history, notes, and metrics.</p>
                        </div>
                        <button
                          onClick={() => setShowResetModal(true)}
                          className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold rounded-xl transition-colors"
                        >
                          Reset Progress
                        </button>
                      </div>

                      {/* Delete Account Button */}
                      <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col justify-between space-y-3">
                        <div>
                          <p className="text-xs font-bold text-white">Delete Account</p>
                          <p className="text-[11px] text-[#737373] mt-1">Permanently erase profile and sign out of GrindFam.</p>
                        </div>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-lg"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL: RESET CONFIRMATION */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1E1E1E] border border-rose-500/40 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-extrabold text-white">Reset All Progress?</h3>
            </div>
            <p className="text-xs text-[#A3A3A3]">
              This will permanently delete all your tracked problem solves, personal notes, and streak stats. Type <strong className="text-rose-400 font-mono">RESET</strong> to confirm.
            </p>
            <input
              type="text"
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              placeholder="Type RESET to confirm"
              className="w-full px-4 py-2.5 bg-[#141414] border border-[#333333] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl border border-[#333333] text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={resetConfirmInput.trim().toUpperCase() !== 'RESET'}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1E1E1E] border border-rose-500/40 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-extrabold text-white">Delete Account?</h3>
            </div>
            <p className="text-xs text-[#A3A3A3]">
              Are you sure you want to delete your GrindFam account? This action cannot be undone. Type <strong className="text-rose-400 font-mono">DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-4 py-2.5 bg-[#141414] border border-[#333333] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-[#333333] text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmInput.trim().toUpperCase() !== 'DELETE'}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
