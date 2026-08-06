import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setLoading(true);
    try { await signIn({ email, password }); navigate('/'); }
    catch (err) { setError(err.message || 'Failed to sign in.'); }
    finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setError(null); setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 auth-bg">
      <div className="w-full max-w-md bg-[#161b22] p-8 rounded-2xl border border-[#30363d] shadow-2xl shadow-black/40 relative z-10 animate-fadeSlideUp">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 mb-4">
            <span className="text-[#22c55e] font-black text-lg">&lt;&gt;</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-[#8b949e] mt-1">Sign in to track your daily LeetCode targets</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-2.5 px-4 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e]/50 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-3 mb-5 disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#8b949e]" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>{googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-[#30363d] w-full"></div>
          <span className="bg-[#161b22] px-3 text-xs text-[#8b949e] uppercase font-semibold">Or</span>
          <div className="border-t border-[#30363d] w-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm" />
            </div>
          </div>
          <button type="submit" disabled={loading || googleLoading}
            className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-5 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#21262d] text-center text-xs text-[#8b949e]">
          Don't have an account? <Link to="/register" className="text-[#22c55e] hover:underline font-semibold">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

