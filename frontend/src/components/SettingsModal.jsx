import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  X, Settings, User, Code2, Bell, Palette, Lock, ShieldAlert, Target,
  ExternalLink, KeyRound, CheckCircle2, AlertCircle, Loader2, Sparkles,
  RefreshCw, FileSpreadsheet, FileJson, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const {
    settings,
    updateSettings,
    verifyingLc,
    syncingLc,
    verifyLeetcode,
    syncLeetcodeNow,
    exportPDF,
    exportCSV,
    exportJSON
  } = useSettings();

  const [activeTab, setActiveTab] = useState('profile');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const [lcError, setLcError] = useState(null);
  const [lcSuccess, setLcSuccess] = useState(null);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long.');
      return;
    }

    setPassLoading(true);
    try {
      await updatePassword(newPassword);
      setPassSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleVerify = async () => {
    setLcError(null);
    setLcSuccess(null);
    try {
      const stats = await verifyLeetcode(settings.leetcodeUsername);
      setLcSuccess(`Verified: ${stats.totalSolved} solved (${stats.easySolved}E, ${stats.mediumSolved}M, ${stats.hardSolved}H)`);
    } catch (err) {
      setLcError(err.message || 'Failed to verify handle.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Target', icon: User },
    { id: 'grind', label: 'Grind Pacing', icon: Target },
    { id: 'leetcode', label: 'LeetCode Sync', icon: Code2 },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'data', label: 'Data', icon: ShieldAlert }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#333333] dark:border-[#333333] light:border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">Account Settings</h3>
                <p className="text-xs text-zinc-400">Quick settings & preference manager</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onClose(); navigate('/settings'); }}
                className="px-3 py-1.5 bg-[#EA5D3A]/10 hover:bg-[#EA5D3A]/20 text-[#EA5D3A] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Full Settings Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Tab Bar */}
          <div className="flex overflow-x-auto border-b border-[#333333] px-4 bg-[#141414] no-scrollbar flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-[#EA5D3A] text-[#EA5D3A]'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => updateSettings({ name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#141414] border border-[#333333] rounded-xl text-white text-xs focus:outline-none focus:border-[#EA5D3A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    LeetCode Username
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.leetcodeUsername}
                      onChange={(e) => updateSettings({ leetcodeUsername: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#141414] border border-[#333333] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#EA5D3A]"
                    />
                    <button
                      onClick={handleVerify}
                      disabled={verifyingLc}
                      className="px-3.5 py-2 bg-[#EA5D3A] hover:bg-[#F2704E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                    >
                      {verifyingLc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Verify</span>
                    </button>
                  </div>
                  {lcSuccess && <p className="text-[11px] text-emerald-400 mt-1">{lcSuccess}</p>}
                  {lcError && <p className="text-[11px] text-rose-400 mt-1">{lcError}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Target Company</label>
                    <select
                      value={settings.targetCompany}
                      onChange={(e) => updateSettings({ targetCompany: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-white text-xs"
                    >
                      {['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Uber', 'Stripe', 'Nvidia', 'OpenAI'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Target Interview Date</label>
                    <input
                      type="date"
                      value={settings.targetInterviewDate}
                      onChange={(e) => updateSettings({ targetInterviewDate: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'grind' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Daily Problem Target</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 5, 10].map(num => (
                      <button
                        key={num}
                        onClick={() => updateSettings({ dailyTarget: num })}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                          settings.dailyTarget === num ? 'bg-[#EA5D3A] text-white border-[#EA5D3A]' : 'bg-[#141414] text-zinc-400 border-[#333333]'
                        }`}
                      >
                        {num} / day
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Default Language</label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-white text-xs"
                  >
                    {['C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'leetcode' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#141414] border border-[#333333] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Manual Sync</p>
                    <p className="text-[10px] text-zinc-400">Trigger immediate stats update</p>
                  </div>
                  <button
                    onClick={syncLeetcodeNow}
                    disabled={syncingLc}
                    className="px-4 py-2 bg-[#EA5D3A] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingLc ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#333333]">
                  <div>
                    <p className="text-xs font-bold text-white">Daily Reminder Time</p>
                  </div>
                  <input
                    type="time"
                    value={settings.dailyReminderTime}
                    onChange={(e) => updateSettings({ dailyReminderTime: e.target.value })}
                    className="px-2.5 py-1 bg-[#1E1E1E] border border-[#333333] rounded text-xs text-white"
                  />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {['dark', 'light', 'auto'].map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSettings({ theme: t })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                        settings.theme === t ? 'bg-[#EA5D3A] text-white border-[#EA5D3A]' : 'bg-[#141414] text-zinc-400 border-[#333333]'
                      }`}
                    >
                      {t} Mode
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#333333]">
                  <p className="text-xs font-bold text-white">Show on Global Leaderboard</p>
                  <button
                    onClick={() => updateSettings({ showOnLeaderboard: !settings.showOnLeaderboard })}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      settings.showOnLeaderboard ? 'bg-[#EA5D3A]' : 'bg-[#333333]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.showOnLeaderboard ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="grid grid-cols-3 gap-3">
                <button onClick={exportPDF} className="p-3 bg-[#141414] border border-[#333333] rounded-xl text-xs font-bold text-white hover:border-[#EA5D3A]">
                  PDF Report
                </button>
                <button onClick={exportCSV} className="p-3 bg-[#141414] border border-[#333333] rounded-xl text-xs font-bold text-white hover:border-emerald-500">
                  Export CSV
                </button>
                <button onClick={exportJSON} className="p-3 bg-[#141414] border border-[#333333] rounded-xl text-xs font-bold text-white hover:border-indigo-500">
                  Export JSON
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#333333] bg-[#141414] flex justify-between items-center">
            <button
              onClick={() => { onClose(); navigate('/settings'); }}
              className="text-xs text-[#EA5D3A] hover:underline font-semibold"
            >
              Open Full Settings Page →
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2C2C2C] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
