import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X, Settings, KeyRound, Lock, User, Mail, Code2, AlertCircle, CheckCircle2, Loader2, ShieldCheck
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

  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const email = user?.email || profile?.email || 'N/A';
  const leetcodeUsername = profile?.leetcode_username || user?.user_metadata?.leetcode_username || 'Not set';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Account Settings</h3>
                <p className="text-xs text-[#8b949e]">Manage your profile and change account password</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#21262d] px-6 bg-[#0d1117]/50">
            <button
              onClick={() => { setActiveTab('password'); setError(null); setSuccess(false); }}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'password'
                  ? 'border-[#EA5D3A] text-[#EA5D3A]'
                  : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
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
                  : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Info</span>
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
                    <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#EA5D3A] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#EA5D3A] text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl border border-[#30363d] text-xs font-semibold text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] hover:from-[#D84C2A] hover:to-[#EA5D3A] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
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
                <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#21262d]">
                    <div className="p-2 rounded-lg bg-[#EA5D3A]/10 text-[#EA5D3A]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8b949e] font-semibold uppercase tracking-wider">Full Name</p>
                      <p className="text-sm font-bold text-white">{name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pb-3 border-b border-[#21262d]">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8b949e] font-semibold uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-bold text-white">{email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8b949e] font-semibold uppercase tracking-wider">LeetCode Username</p>
                      <p className="text-sm font-bold text-[#EA5D3A] font-mono">{leetcodeUsername}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white font-semibold rounded-xl text-xs transition-colors"
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
