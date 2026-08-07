import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, KeyRound, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 auth-bg relative overflow-hidden">
      {/* Subtle ambient lighting & dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(234,88,12,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />

      <div className="w-full max-w-md bg-[#121212] p-8 rounded-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative z-10 animate-fadeSlideUp hover:border-[#EA580C]/30 transition-all duration-300">
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center justify-center gap-2.5 mb-4 group text-decoration-none">
            <img
              src="/logo.png"
              alt="GrindFam Logo"
              className="w-9 h-9 rounded-xl object-cover border border-white/10 shadow-[0_0_15px_rgba(234,88,12,0.3)] group-hover:scale-105 transition-transform"
            />
            <span className="font-display font-black text-2xl tracking-tighter text-[#FAFAFA]">
              Grind<span className="text-[#F97316]">Fam</span>
            </span>
          </Link>
          <h2 className="font-display font-black text-2xl text-white tracking-tighter uppercase">Set New Password</h2>
          <p className="text-xs text-[#8A8A85] mt-1.5 font-medium tracking-tight">Please enter your new password below</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-xl bg-[#EA580C]/10 border border-[#EA580C]/25 text-[#FAFAFA] text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#EA580C]" />
              <span>Password updated successfully! Redirecting to Sign In...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8A8A85] uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681] group-focus-within:text-[#EA580C] transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#151515] border border-white/10 rounded-xl text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]/40 text-sm tracking-[-0.01em] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8A8A85] uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681] group-focus-within:text-[#EA580C] transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#151515] border border-white/10 rounded-xl text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]/40 text-sm tracking-[-0.01em] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#D97706] hover:to-[#EA580C] text-[#FAFAFA] font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-5 shadow-[0_4px_14px_rgba(234,88,12,0.25)] hover:shadow-[0_6px_18px_rgba(234,88,12,0.35)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-[#8A8A85]">
          Back to{' '}
          <Link to="/login" className="text-[#EA580C] hover:text-[#F97316] hover:underline font-semibold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
