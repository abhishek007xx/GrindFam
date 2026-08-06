import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  Settings as SettingsIcon, KeyRound, Lock, User, Mail, Code2, AlertCircle,
  CheckCircle2, Loader2, ShieldCheck, Target, ArrowRight
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const email = user?.email || profile?.email || 'N/A';
  const leetcodeUsername = profile?.leetcode_username || user?.user_metadata?.leetcode_username || 'Not set';

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

  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      {/* Sidebar */}
      <Sidebar activeSection="settings" />

      {/* Content */}
      <div className="page-content flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="page-main max-w-4xl mx-auto w-full py-8 px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e]">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">Account Settings</h1>
                <p className="text-xs text-[#8b949e]">Manage your profile and update your password</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Change Password */}
            <div className="dash-card p-6 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-xl">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#21262d]">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">Change Password</h2>
                  <p className="text-[11px] text-[#8b949e]">Update your account password</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
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
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{loading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </form>
            </div>

            {/* Card 2: Profile Details */}
            <div className="dash-card p-6 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#21262d]">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">Profile Details</h2>
                    <p className="text-[11px] text-[#8b949e]">Your personal GrindFam identity</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center gap-3">
                    <User className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#8b949e] font-semibold uppercase tracking-wider">Name</p>
                      <p className="text-sm font-bold text-white">{name}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center gap-3">
                    <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#8b949e] font-semibold uppercase tracking-wider">Email</p>
                      <p className="text-sm font-bold text-white">{email}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#8b949e] font-semibold uppercase tracking-wider">LeetCode Username</p>
                      <p className="text-sm font-bold text-emerald-400 font-mono">{leetcodeUsername}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#21262d]">
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-2.5 px-4 bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Back to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
