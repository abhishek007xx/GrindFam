import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setLoading(true);
    try { await signIn({ email, password }); navigate('/'); }
    catch (err) { setError(err.message || 'Failed to sign in.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161b22] p-8 rounded-2xl border border-[#30363d] shadow-2xl">
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
          <button type="submit" disabled={loading}
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
