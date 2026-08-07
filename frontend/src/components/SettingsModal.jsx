import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  X, Settings, KeyRound, Lock, User, Mail, Code2, AlertCircle, CheckCircle2, Loader2, ShieldCheck, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, profile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'profile'
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // LeetCode Username Edit State
  const [editLcUsername, setEditLcUsername] = useState('');
  const [lcUpdating, setLcUpdating] = useState(false);
  const [lcSuccess, setLcSuccess] = useState(false);
  const [lcError, setLcError] = useState(null);

  useEffect(() => {
    if (profile?.leetcode_username) {
      setEditLcUsername(profile.leetcode_username);
    } else if (user?.user_metadata?.leetcode_username) {
      setEditLcUsername(user.user_metadata.leetcode_username);
    }
  }, [profile, user]);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLeetcodeUsername = async (e) => {
    e.preventDefault();
    setLcError(null);
    setLcSuccess(false);

    const val = editLcUsername.trim();
    if (!val) {
      setLcError('LeetCode Username cannot be empty.');
      return;
    }

    setLcUpdating(true);

    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ leetcode_username: val })
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      setLcSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setLcError(err.message || 'Failed to update LeetCode username.');
    } finally {
      setLcUpdating(false);
    }
  };

  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const email = user?.email || profile?.email || 'N/A';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#121318] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Account Settings</h3>
                <p className="text-xs text-zinc-400">Manage your profile and LeetCode handle</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#27272A] px-6 bg-[#09090B]">
            <button
              onClick={() => { setActiveTab('password'); setError(null); setSuccess(false); }}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'password'
                  ? 'border-[#EA5D3A] text-[#EA5D3A]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); setError(null); setSuccess(false); }}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'profile'
                  ? 'border-[#EA5D3A] text-[#EA5D3A]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile & LeetCode Handle</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-6">
            {activeTab === 'password' && (
              <div>
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 rounded-xl bg-[#EA5D3A]/10 border border-[#EA5D3A]/25 text-[#EA5D3A] text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Your password has been updated successfully!</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A] text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl border border-[#27272A] text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-[#EA5D3A] hover:bg-[#F2704E] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span>{loading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
                    <div className="p-2 rounded-lg bg-[#EA5D3A]/10 text-[#EA5D3A]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Full Name</p>
                      <p className="text-sm font-bold text-white">{name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-bold text-white">{email}</p>
                    </div>
                  </div>

                  {/* Editable LeetCode Username Field */}
                  <form onSubmit={handleSaveLeetcodeUsername} className="space-y-3 pt-1">
                    {lcError && (
                      <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5" /> <span>{lcError}</span>
                      </div>
                    )}
                    {lcSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> <span>LeetCode username updated! Reloading dashboard...</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        LeetCode Username Handle
                      </label>
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EA5D3A]" />
                          <input
                            type="text"
                            required
                            value={editLcUsername}
                            onChange={(e) => setEditLcUsername(e.target.value)}
                            placeholder="e.g. Iamkartikeyan"
                            className="w-full pl-10 pr-4 py-2 bg-[#121318] border border-[#27272A] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#EA5D3A]"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={lcUpdating}
                          className="px-3.5 py-2 bg-[#EA5D3A] hover:bg-[#F2704E] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 flex-shrink-0"
                        >
                          {lcUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Save Handle</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
