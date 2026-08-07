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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 auth-bg relative overflow-hidden">
      {/* Subtle ambient lighting & dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.14),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />

      <div className="w-full max-w-md bg-[#121212]/90 backdrop-blur-xl p-8 rounded-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative z-10 animate-fadeSlideUp hover:border-[#F97316]/25 hover:shadow-[0_0_30px_rgba(249,115,22,0.12)] transition-all duration-300">
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center justify-center gap-2.5 mb-4 group text-decoration-none">
            <img
              src="/logo.png"
              alt="GrindFam Logo"
              className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-[0_0_20px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl font-black tracking-tight text-white">
              Grind<span className="bg-gradient-to-r from-[#F97316] to-[#FDBA74] bg-clip-text text-transparent">Fam</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Reset Your Password</h2>
          <p className="text-xs text-[#8A8A85] mt-1.5 font-medium">Enter your registered email to receive a password reset link</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-xl bg-[#F97316]/10 border border-[#F97316]/25 text-[#FDBA74] text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#F97316]" />
              <span>Password reset link sent to <strong>{email}</strong>! Please check your inbox.</span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#F97316] via-[#FF8A3D] to-[#FDBA74] hover:brightness-110 text-white font-bold rounded-xl text-sm transition-all duration-200 mt-2 shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:shadow-[0_0_35px_rgba(249,115,22,0.6)] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8A8A85] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681] group-focus-within:text-[#F97316] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#151515] border border-white/10 rounded-xl text-[#F5F5F0] placeholder-[#525252] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/30 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#F97316] via-[#FF8A3D] to-[#FDBA74] hover:brightness-110 text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-5 shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:shadow-[0_0_35px_rgba(249,115,22,0.6)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{loading ? 'Sending Link...' : 'Send Password Reset Link'}</span>
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-[#8A8A85]">
          Remember your password?{' '}
          <Link to="/login" className="text-[#F97316] hover:text-[#FDBA74] hover:underline font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
