import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Trophy, Flame, Globe, Search, Filter, Sparkles, Crown, Zap, CheckCircle2,
  ExternalLink, ArrowUpRight, Award, Shield, Users, Target, ArrowRight, Heart,
  TrendingUp, RefreshCw, Layers, MapPin, ChevronRight, UserCheck
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const avatarGradients = [
  'from-[#EA5D3A] to-amber-600',
  'from-emerald-500 to-teal-700',
  'from-purple-600 to-indigo-700',
  'from-blue-500 to-cyan-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-orange-700',
];

const getAvatarGradient = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

const getInitials = (name = '') => {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function WorldwideLeaderboard() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [leaderboard, setLeaderboard] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalRegisteredUsers: 0,
    totalSolvedWorldwide: 0,
    activeToday: 0,
    highestStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('allTime'); // 'allTime' | 'today' | 'streak'
  const [selectedTier, setSelectedTier] = useState('all'); // 'all' | 'Grandmaster' | 'Master' | 'Expert' | 'Knight'
  const [selectedRegion, setSelectedRegion] = useState('all'); // 'all' | 'US' | 'IN' | 'DE' | 'JP' | 'UK' | 'CA' | 'SG'

  // Toast Notification for Salute / Nudge
  const [toastMessage, setToastMessage] = useState(null);

  const fetchGlobalLeaderboard = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_BASE_URL}/dashboard/global-leaderboard`, { headers });
      if (response.data) {
        setLeaderboard(response.data.leaderboard || []);
        if (response.data.globalStats) {
          setGlobalStats(response.data.globalStats);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch global leaderboard from backend, querying Supabase directly...', err);
      try {
        // Direct Supabase Fallback Query using 100% real user progress data
        const { data: dbProfiles } = await supabase.from('profiles').select('*');
        if (dbProfiles && dbProfiles.length > 0) {
          const userIds = dbProfiles.map(p => p.id);
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('user_id, status, problems(difficulty)')
            .in('user_id', userIds)
            .eq('status', 'solved');

          const progressMap = new Map();
          (progressData || []).forEach(r => {
            if (!progressMap.has(r.user_id)) {
              progressMap.set(r.user_id, { total: 0, easy: 0, medium: 0, hard: 0 });
            }
            const pStats = progressMap.get(r.user_id);
            pStats.total += 1;
            if (r.problems?.difficulty === 'Easy') pStats.easy += 1;
            else if (r.problems?.difficulty === 'Medium') pStats.medium += 1;
            else if (r.problems?.difficulty === 'Hard') pStats.hard += 1;
          });

          const formatted = dbProfiles.map((p) => {
            const pStats = progressMap.get(p.id) || { total: 0, easy: 0, medium: 0, hard: 0 };
            return {
              id: p.id,
              name: p.name || p.username || p.leetcode_username || 'GrindFam Grinder',
              username: p.username || p.leetcode_username || 'grinder',
              leetcodeUsername: p.leetcode_username || 'user',
              avatarUrl: p.avatar_url || null,
              country: p.country || '🌐 Worldwide',
              countryCode: p.country_code || 'WW',
              targetCompany: p.target_company || 'Software Engineer',
              tier: pStats.total >= 500 ? 'Grandmaster' : pStats.total >= 250 ? 'Master' : pStats.total >= 100 ? 'Expert' : pStats.total >= 30 ? 'Knight' : 'Apprentice',
              platformTotal: pStats.total,
              todayCount: 0,
              easyCount: pStats.easy,
              mediumCount: pStats.medium,
              hardCount: pStats.hard,
              streak: 0,
              xp: pStats.total * 50,
              targetHit: false,
              isSelf: p.id === currentUser?.id,
              isRegistered: true
            };
          });

          formatted.sort((a, b) => b.platformTotal - a.platformTotal);
          const ranked = formatted.map((item, i) => ({ ...item, rank: i + 1 }));

          setLeaderboard(ranked);
          setGlobalStats({
            totalRegisteredUsers: ranked.length,
            totalSolvedWorldwide: ranked.reduce((acc, curr) => acc + curr.platformTotal, 0),
            activeToday: 0,
            highestStreak: 0
          });
        }
      } catch (sbErr) {
        setError('Unable to load worldwide leaderboard. Please try again later.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGlobalLeaderboard();
  };

  const handleSalute = (user) => {
    setToastMessage(`⚡ Saluted ${user.name}! +10 Reputation earned.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered & Sorted Leaderboard
  const filteredLeaderboard = useMemo(() => {
    let result = [...leaderboard];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.leetcodeUsername && u.leetcodeUsername.toLowerCase().includes(q)) ||
        (u.targetCompany && u.targetCompany.toLowerCase().includes(q)) ||
        (u.country && u.country.toLowerCase().includes(q))
      );
    }

    // Tier filter
    if (selectedTier !== 'all') {
      result = result.filter(u => u.tier === selectedTier);
    }

    // Region filter
    if (selectedRegion !== 'all') {
      result = result.filter(u => u.countryCode === selectedRegion);
    }

    // Timeframe sort
    result.sort((a, b) => {
      if (timeframe === 'today') {
        if (b.todayCount !== a.todayCount) return b.todayCount - a.todayCount;
        return b.platformTotal - a.platformTotal;
      }
      if (timeframe === 'streak') {
        if (b.streak !== a.streak) return b.streak - a.streak;
        return b.platformTotal - a.platformTotal;
      }
      // All time
      return b.platformTotal - a.platformTotal;
    });

    // Re-assign display ranks for current filtered view
    return result.map((item, idx) => ({ ...item, displayRank: idx + 1 }));
  }, [leaderboard, searchQuery, timeframe, selectedTier, selectedRegion]);

  // Top 3 Podium
  const topThreePodium = useMemo(() => {
    const sorted = [...leaderboard].sort((a, b) => b.platformTotal - a.platformTotal);
    return {
      first: sorted[0] || null,
      second: sorted[1] || null,
      third: sorted[2] || null
    };
  }, [leaderboard]);

  // Current logged in user position
  const myGlobalRank = useMemo(() => {
    if (!currentUser) return null;
    return leaderboard.find(u => u.isSelf || u.id === currentUser.id);
  }, [leaderboard, currentUser]);

  return (
    <div className="min-h-screen bg-[#141414] text-white p-4 sm:p-6 md:p-8 space-y-8">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EA5D3A] to-amber-600 text-white text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/20"
          >
            <Zap className="w-4 h-4 fill-white animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E1E1E] via-[#261C18] to-[#1E1E1E] border border-[#333333] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA5D3A]/10 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] text-xs font-bold tracking-wider uppercase">
              <Globe className="w-3.5 h-3.5 animate-pulse" />
              <span>Worldwide Platform Rankings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Global Leaderboard
              <Crown className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
            </h1>
            <p className="text-sm text-[#A3A3A3] max-w-xl leading-relaxed">
              Track real-time rankings of all registered members across the world. Compete in problem solving, build daily streaks, and claim your place among top engineers.
            </p>
          </div>

          {/* Action Header Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#262626] hover:bg-[#333333] border border-[#333333] text-xs font-semibold transition-all active:scale-95 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#EA5D3A] ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
          </div>
        </div>

        {/* ── GLOBAL SUMMARY STATS BAR ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-[#333333]/80">
          <div className="p-3.5 rounded-xl bg-[#141414]/60 border border-[#333333] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Registered Members</span>
            </div>
            <p className="text-xl font-bold font-mono text-white">{globalStats.totalRegisteredUsers}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414]/60 border border-[#333333] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
              <Zap className="w-3.5 h-3.5 text-[#EA5D3A]" />
              <span>Worldwide Solved</span>
            </div>
            <p className="text-xl font-bold font-mono text-white">{globalStats.totalSolvedWorldwide.toLocaleString()}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414]/60 border border-[#333333] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Active Today</span>
            </div>
            <p className="text-xl font-bold font-mono text-emerald-400">{globalStats.activeToday} Grinders</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414]/60 border border-[#333333] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Longest Streak</span>
            </div>
            <p className="text-xl font-bold font-mono text-amber-400">{globalStats.highestStreak} Days</p>
          </div>
        </div>
      </div>

      {/* ── 2. TOP 3 PODIUM (HALL OF FAME) ── */}
      {topThreePodium.first && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Worldwide Hall of Fame
            </h2>
            <span className="text-xs text-[#A3A3A3]">Top 3 All-Time Champions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* SECOND PLACE (SILVER) */}
            {topThreePodium.second && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="order-2 md:order-1 bg-[#1E1E1E] border border-slate-700/60 rounded-2xl p-5 relative overflow-hidden flex flex-col items-center text-center shadow-lg hover:border-slate-500 transition-all group"
              >
                <div className="absolute top-0 right-0 bg-slate-300/10 text-slate-300 border-b border-l border-slate-400/30 font-extrabold text-xs px-3 py-1 rounded-bl-xl">
                  🥈 RANK #2
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-500 p-0.5 mt-2 mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#141414] overflow-hidden flex items-center justify-center">
                    {topThreePodium.second.avatarUrl ? (
                      <img src={topThreePodium.second.avatarUrl} alt={topThreePodium.second.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-200 font-extrabold text-xl">{getInitials(topThreePodium.second.name)}</span>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-base text-white truncate max-w-[180px]">{topThreePodium.second.name}</h3>
                <p className="text-xs text-[#A3A3A3] mb-3">@{topThreePodium.second.leetcodeUsername}</p>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-500/10 px-2.5 py-1 rounded-full border border-slate-500/20 mb-4">
                  <span>{topThreePodium.second.country}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full pt-3 border-t border-[#333333] text-xs">
                  <div>
                    <p className="text-[10px] text-[#A3A3A3]">Solved</p>
                    <p className="font-bold font-mono text-white text-base">{topThreePodium.second.platformTotal}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#A3A3A3]">Streak</p>
                    <p className="font-bold font-mono text-amber-400 text-base">{topThreePodium.second.streak}d 🔥</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/p/${topThreePodium.second.leetcodeUsername || topThreePodium.second.username}`)}
                  className="mt-4 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span>View Portfolio</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </motion.div>
            )}

            {/* FIRST PLACE (GOLD) - ELEVATED */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="order-1 md:order-2 bg-gradient-to-b from-[#2A2312] to-[#1E1E1E] border-2 border-amber-500/70 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-[0_0_30px_rgba(245,158,11,0.2)] md:-translate-y-3 hover:scale-[1.02] transition-all group"
            >
              <div className="absolute top-0 right-0 bg-amber-500 text-zinc-950 font-extrabold text-xs px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-zinc-950" />
                <span>🥇 RANK #1 MVP</span>
              </div>

              <div className="relative mt-2 mb-3">
                <Crown className="w-7 h-7 text-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-bounce" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 p-1 shadow-xl group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#141414] overflow-hidden flex items-center justify-center">
                    {topThreePodium.first.avatarUrl ? (
                      <img src={topThreePodium.first.avatarUrl} alt={topThreePodium.first.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-amber-400 font-extrabold text-2xl">{getInitials(topThreePodium.first.name)}</span>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="font-extrabold text-lg text-white truncate max-w-[200px]">{topThreePodium.first.name}</h3>
              <p className="text-xs text-amber-400 font-semibold mb-3">@{topThreePodium.first.leetcodeUsername}</p>

              <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 mb-4">
                <span>{topThreePodium.first.country}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full pt-3 border-t border-amber-500/30 text-xs">
                <div>
                  <p className="text-[10px] text-amber-200/70">Total Solved</p>
                  <p className="font-extrabold font-mono text-amber-300 text-lg">{topThreePodium.first.platformTotal}</p>
                </div>
                <div>
                  <p className="text-[10px] text-amber-200/70">Streak</p>
                  <p className="font-extrabold font-mono text-amber-400 text-lg">{topThreePodium.first.streak}d 🔥</p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/p/${topThreePodium.first.leetcodeUsername || topThreePodium.first.username}`)}
                className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Explore Champion Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* THIRD PLACE (BRONZE) */}
            {topThreePodium.third && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="order-3 bg-[#1E1E1E] border border-amber-800/60 rounded-2xl p-5 relative overflow-hidden flex flex-col items-center text-center shadow-lg hover:border-amber-700 transition-all group"
              >
                <div className="absolute top-0 right-0 bg-amber-700/20 text-amber-300 border-b border-l border-amber-600/30 font-extrabold text-xs px-3 py-1 rounded-bl-xl">
                  🥉 RANK #3
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 p-0.5 mt-2 mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#141414] overflow-hidden flex items-center justify-center">
                    {topThreePodium.third.avatarUrl ? (
                      <img src={topThreePodium.third.avatarUrl} alt={topThreePodium.third.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-amber-500 font-extrabold text-xl">{getInitials(topThreePodium.third.name)}</span>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-base text-white truncate max-w-[180px]">{topThreePodium.third.name}</h3>
                <p className="text-xs text-[#A3A3A3] mb-3">@{topThreePodium.third.leetcodeUsername}</p>

                <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-700/30 mb-4">
                  <span>{topThreePodium.third.country}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full pt-3 border-t border-[#333333] text-xs">
                  <div>
                    <p className="text-[10px] text-[#A3A3A3]">Solved</p>
                    <p className="font-bold font-mono text-white text-base">{topThreePodium.third.platformTotal}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#A3A3A3]">Streak</p>
                    <p className="font-bold font-mono text-amber-400 text-base">{topThreePodium.third.streak}d 🔥</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/p/${topThreePodium.third.leetcodeUsername || topThreePodium.third.username}`)}
                  className="mt-4 w-full py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-zinc-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span>View Portfolio</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. FILTER & SEARCH CONTROL TOOLBAR ── */}
      <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Timeframe Filter Tabs */}
          <div className="flex items-center bg-[#141414] p-1 rounded-xl border border-[#333333] self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setTimeframe('allTime')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                timeframe === 'allTime'
                  ? 'bg-[#EA5D3A] text-white shadow-md'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>All-Time Solved</span>
            </button>

            <button
              onClick={() => setTimeframe('today')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                timeframe === 'today'
                  ? 'bg-[#EA5D3A] text-white shadow-md'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Today's Hot</span>
            </button>

            <button
              onClick={() => setTimeframe('streak')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                timeframe === 'streak'
                  ? 'bg-[#EA5D3A] text-white shadow-md'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Streak Kings</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search worldwide grinders, handles, target companies..."
              className="w-full pl-10 pr-4 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#EA5D3A] transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A3A3A3] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Sub-Filters: Tiers & Regions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#333333]/60 text-xs">
          {/* Tier Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-semibold text-[#737373] mr-1">Tier:</span>
            {[
              { id: 'all', label: 'All Tiers' },
              { id: 'Grandmaster', label: '👑 Grandmaster (500+)' },
              { id: 'Master', label: '💎 Master (250+)' },
              { id: 'Expert', label: '⚡ Expert (100+)' },
              { id: 'Knight', label: '🛡️ Knight (30+)' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  selectedTier === t.id
                    ? 'bg-[#EA5D3A]/20 text-[#EA5D3A] border border-[#EA5D3A]/40 font-bold'
                    : 'bg-[#141414] text-[#A3A3A3] hover:text-white border border-[#333333]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-semibold text-[#737373] mr-1">Region:</span>
            {[
              { id: 'all', label: '🌐 All' },
              { id: 'US', label: '🇺🇸 US' },
              { id: 'IN', label: '🇮🇳 IN' },
              { id: 'DE', label: '🇩🇪 DE' },
              { id: 'JP', label: '🇯🇵 JP' },
              { id: 'UK', label: '🇬🇧 UK' },
              { id: 'CA', label: '🇨🇦 CA' },
              { id: 'SG', label: '🇸🇬 SG' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  selectedRegion === r.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-[#141414] text-[#A3A3A3] hover:text-white border border-[#333333]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. WORLDWIDE LEADERBOARD TABLE ── */}
      <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="grid grid-cols-[55px_1fr_90px_110px_90px_80px_100px] items-center px-5 py-3 bg-[#141414] border-b border-[#333333] text-[10px] font-bold text-[#737373] uppercase tracking-wider">
          <span>Rank</span>
          <span>Worldwide Grinder</span>
          <span className="text-center">Target Role</span>
          <span className="text-center">Difficulty Breakdown</span>
          <span className="text-center">Today Solved</span>
          <span className="text-center">Streak</span>
          <span className="text-center">Total Solved</span>
        </div>

        {/* Loading / Error / Empty States */}
        {loading ? (
          <div className="py-16 text-center text-sm text-[#A3A3A3] space-y-3">
            <div className="w-8 h-8 border-4 border-[#EA5D3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Fetching real-time worldwide rankings...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-rose-400 space-y-2">
            <p>{error}</p>
            <button onClick={fetchGlobalLeaderboard} className="px-3 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-xs font-bold">Retry</button>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#737373]">
            No worldwide grinders matched your search criteria. Try resetting filters.
          </div>
        ) : (
          <div className="divide-y divide-[#333333]/50">
            {filteredLeaderboard.map((user) => {
              const isFirst = user.displayRank === 1;
              const isSecond = user.displayRank === 2;
              const isThird = user.displayRank === 3;
              const gradient = getAvatarGradient(user.name || user.id);

              let rowBg = 'hover:bg-white/[0.02]';
              if (user.isSelf) rowBg = 'bg-[#EA5D3A]/[0.06] hover:bg-[#EA5D3A]/[0.10] border-l-4 border-[#EA5D3A]';
              else if (isFirst) rowBg = 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08]';

              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-[55px_1fr_90px_110px_90px_80px_100px] items-center px-5 py-3.5 transition-all ${rowBg}`}
                >
                  {/* Rank */}
                  <div className="flex items-center">
                    {isFirst ? (
                      <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center justify-center border border-amber-500/40 shadow-sm">
                        #1
                      </span>
                    ) : isSecond ? (
                      <span className="w-7 h-7 rounded-full bg-slate-300/20 text-slate-200 font-extrabold text-xs flex items-center justify-center border border-slate-300/40">
                        #2
                      </span>
                    ) : isThird ? (
                      <span className="w-7 h-7 rounded-full bg-amber-800/30 text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-700/40">
                        #3
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#A3A3A3] ml-1">
                        #{user.displayRank}
                      </span>
                    )}
                  </div>

                  {/* Grinder Info */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} p-0.5 flex-shrink-0 shadow-md`}>
                      <div className="w-full h-full rounded-full bg-[#141414] overflow-hidden flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-xs">{getInitials(user.name)}</span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white truncate hover:underline cursor-pointer" onClick={() => navigate(`/p/${user.leetcodeUsername || user.username}`)}>
                          {user.name}
                        </span>
                        {user.isSelf && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-[#EA5D3A] text-white">
                            YOU
                          </span>
                        )}
                        <span className="text-[10px] text-[#A3A3A3]">{user.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#A3A3A3]">
                        <span>@{user.leetcodeUsername || user.username}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#262626] text-amber-400 font-semibold border border-[#333333]">
                          {user.tier}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Target Company */}
                  <div className="text-center min-w-0 px-1">
                    <span className="inline-block max-w-full px-2 py-0.5 rounded-full bg-[#262626] text-zinc-300 text-[10px] font-semibold border border-[#333333] truncate">
                      {user.targetCompany || 'SDE-2'}
                    </span>
                  </div>

                  {/* Difficulty Breakdown (Easy/Medium/Hard) */}
                  <div className="flex items-center justify-center gap-1 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" title="Easy Solved">
                      {user.easyCount || 0}E
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30" title="Medium Solved">
                      {user.mediumCount || 0}M
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30" title="Hard Solved">
                      {user.hardCount || 0}H
                    </span>
                  </div>

                  {/* Today Solved */}
                  <div className="text-center font-mono">
                    <span className={`text-xs font-bold ${user.todayCount > 0 ? 'text-[#EA5D3A]' : 'text-[#737373]'}`}>
                      {user.todayCount || 0}
                    </span>
                    {user.targetHit && (
                      <span className="ml-1 text-[9px] text-emerald-400 font-bold">✓</span>
                    )}
                  </div>

                  {/* Streak */}
                  <div className="text-center font-mono">
                    <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      {user.streak || 0}d
                    </span>
                  </div>

                  {/* Total Solved & Actions */}
                  <div className="flex items-center justify-between gap-2 pl-2">
                    <span className="text-sm font-extrabold font-mono text-white">
                      {user.platformTotal}
                    </span>
                    <button
                      onClick={() => handleSalute(user)}
                      className="p-1.5 rounded-lg bg-[#262626] hover:bg-[#EA5D3A] text-zinc-400 hover:text-white transition-colors"
                      title={`Salute ${user.name}`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-[#141414] border-t border-[#333333] flex items-center justify-between text-xs text-[#A3A3A3]">
          <span>Showing {filteredLeaderboard.length} worldwide grinders</span>
          <span className="font-semibold text-[#EA5D3A] flex items-center gap-1 cursor-pointer hover:underline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to top <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* ── 5. MY GLOBAL RANK FLOATING FOOTER BANNER ── */}
      {myGlobalRank && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky bottom-4 z-40 max-w-4xl mx-auto p-4 rounded-2xl bg-[#1E1E1E]/95 border border-[#EA5D3A]/50 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EA5D3A] text-white font-extrabold text-sm flex items-center justify-center shadow-md">
              #{myGlobalRank.rank}
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                Your Worldwide Position
                <span className="px-1.5 py-0.2 rounded bg-[#EA5D3A]/20 text-[#EA5D3A] text-[9px] font-extrabold">Active</span>
              </p>
              <p className="text-[11px] text-[#A3A3A3]">
                {myGlobalRank.platformTotal} Solved • {myGlobalRank.streak} Day Streak • Keep grinding to level up!
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/portfolio')}
            className="px-4 py-2 rounded-xl bg-[#EA5D3A] hover:bg-[#f2704e] text-white text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0"
          >
            <span>My Profile Stats</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
