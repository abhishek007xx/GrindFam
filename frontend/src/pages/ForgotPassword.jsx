import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 auth-bg relative overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Barely perceptible warm ambient lighting & subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(234,93,58,0.035),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />

      <div className="w-full max-w-md bg-[#121212] p-8 rounded-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative z-10 animate-fadeSlideUp hover:border-white/15 transition-colors duration-300">
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center justify-center gap-2.5 mb-4 group text-decoration-none">
            <img
              src="/logo.png"
              alt="GrindFam Logo"
              className="w-9 h-9 rounded-xl object-cover border border-white/10 shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-2xl tracking-tighter text-[#FAFAFA]">
              Grind<span className="text-[#EA5D3A]">Fam</span>
            </span>
          </Link>
          <h2 className="font-black text-2xl text-white tracking-tighter uppercase">Reset Your Password</h2>
          <p className="text-xs text-[#8A8A85] mt-1.5 font-medium tracking-tight">Enter your registered email to receive a password reset link</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-xl bg-[#EA5D3A]/10 border border-[#EA5D3A]/25 text-[#FAFAFA] text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#EA5D3A]" />
              <span>Password reset link sent to <strong>{email}</strong>! Please check your inbox.</span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] hover:from-[#D84C2A] hover:to-[#EA5D3A] text-[#FAFAFA] font-semibold rounded-xl text-sm transition-all duration-200 mt-2 shadow-[0_4px_14px_rgba(234,93,58,0.25)] hover:shadow-[0_6px_18px_rgba(234,93,58,0.35)] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8A8A85] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#151515] border border-white/10 rounded-xl text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:border-[#EA5D3A] focus:ring-1 focus:ring-[#EA5D3A]/40 text-sm tracking-[-0.01em] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] hover:from-[#D84C2A] hover:to-[#EA5D3A] text-[#FAFAFA] font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-5 shadow-[0_4px_14px_rgba(234,93,58,0.25)] hover:shadow-[0_6px_18px_rgba(234,93,58,0.35)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{loading ? 'Sending Link...' : 'Send Password Reset Link'}</span>
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-[#8A8A85]">
          Remember your password?{' '}
          <Link to="/login" className="text-[#EA5D3A] hover:text-[#F2704E] hover:underline font-semibold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
