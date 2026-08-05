import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { companiesData, sheetsData } from '../lib/dataFallback';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatsCards from '../components/StatsCards';
import LeaderboardTable from '../components/LeaderboardTable';
import WeeklyProgress from '../components/WeeklyProgress';
import RecentActivity from '../components/RecentActivity';
import ProgressChart, { MotivationalCard } from '../components/ProgressChart';
import AddFriend from '../components/AddFriend';
import EditTargetModal from '../components/EditTargetModal';
import SquadManagerModal from '../components/SquadManagerModal';
import ContributionHeatmap from '../components/ContributionHeatmap';
import {
  Loader2, AlertCircle, RefreshCw, Heart, Shield, Copy, Check, Users,
  Flame, ArrowRight, RotateCcw, BookOpen, Building2, FileCode2,
  Target, TrendingUp, Zap, Clock, ChevronRight, ExternalLink, Sparkles
} from 'lucide-react';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};
const API_BASE_URL = getApiBaseUrl();

// ── Progress Ring Component ──
function ProgressRing({ percentage, size = 80, strokeWidth = 8, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#21262d" strokeWidth={strokeWidth} fill="transparent"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="url(#dash-emerald-grad)" strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="dash-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-extrabold text-white font-mono leading-none">{percentage}%</span>
        {label && <span className="text-[9px] text-[#8b949e] mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

// ── Streak Calculator ──
function calculateStreak(solvedDates) {
  if (!solvedDates || solvedDates.length === 0) return 0;
  const uniqueDays = [...new Set(solvedDates.map(d => {
    const dt = new Date(d);
    return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}-${String(dt.getUTCDate()).padStart(2,'0')}`;
  }))].sort().reverse();

  let streak = 0;
  const today = new Date();
  const todayStr = `${today.getUTCFullYear()}-${String(today.getUTCMonth()+1).padStart(2,'0')}-${String(today.getUTCDate()).padStart(2,'0')}`;
  const yesterdayDate = new Date(today);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterdayStr = `${yesterdayDate.getUTCFullYear()}-${String(yesterdayDate.getUTCMonth()+1).padStart(2,'0')}-${String(yesterdayDate.getUTCDate()).padStart(2,'0')}`;

  // Start counting from today or yesterday
  let startIdx = -1;
  if (uniqueDays[0] === todayStr) startIdx = 0;
  else if (uniqueDays[0] === yesterdayStr) startIdx = 0;
  else return 0;

  let checkDate = new Date(uniqueDays[startIdx] + 'T00:00:00Z');

  for (let i = startIdx; i < uniqueDays.length; i++) {
    const expectedStr = `${checkDate.getUTCFullYear()}-${String(checkDate.getUTCMonth()+1).padStart(2,'0')}-${String(checkDate.getUTCDate()).padStart(2,'0')}`;
    if (uniqueDays[i] === expectedStr) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}


const Dashboard = () => {
  const navigate = useNavigate();
  const { token, profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dailyTarget, setDailyTarget] = useState(5);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    dailyTarget: 5,
    squadInfo: null,
    stats: { totalFriends: 0, hitTargetTodayCount: 0, yourTodayCount: 0, yourTargetHit: false, yourPlatformTotal: 0 },
    leaderboard: []
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [removingId, setRemovingId] = useState(null);

  // ─── NEW: DSA Overview State ───
  const [dsaLoading, setDsaLoading] = useState(true);
  const [dsaStats, setDsaStats] = useState({
    totalSolved: 0,
    totalProblems: 0,
    streak: 0,
    revisionQueue: [],
    resumeTracks: [],
    topicBreakdown: {}
  });

  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const yourTodayCount = dashboardData.stats?.yourTodayCount || 0;
  const yourPlatformTotal = dashboardData.stats?.yourPlatformTotal || 0;

  // ─── Leaderboard API fetch ───
  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (!token) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      if (response.data?.dailyTarget) setDailyTarget(response.data.dailyTarget);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch leaderboard data.');
    } finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ─── NEW: Fetch DSA Overview from Supabase ───
  useEffect(() => {
    async function fetchDSAOverview() {
      if (!user) { setDsaLoading(false); return; }
      try {
        setDsaLoading(true);

        // 1. Get all user progress
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('problem_id, status, solved_at, personal_notes')
          .eq('user_id', user.id);

        const solvedEntries = (progressData || []).filter(p => p.status === 'solved');
        const revisionEntries = (progressData || []).filter(p => p.status === 'revision_needed');

        // 2. Calculate streak from solved_at dates
        const solvedDates = solvedEntries.filter(e => e.solved_at).map(e => e.solved_at);
        const streak = calculateStreak(solvedDates);

        // 3. Get total problems count
        const { count: totalProblems } = await supabase
          .from('problems')
          .select('*', { count: 'exact', head: true });

        // 4. Get problem details for revision queue
        const revisionProblemIds = revisionEntries.map(r => r.problem_id);
        // Also get problems solved >30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const staleEntries = solvedEntries.filter(e =>
          e.solved_at && new Date(e.solved_at) < thirtyDaysAgo
        );
        const staleProblemIds = staleEntries.map(s => s.problem_id);

        const allRevisionIds = [...new Set([...revisionProblemIds, ...staleProblemIds])].slice(0, 20);

        let revisionQueue = [];
        if (allRevisionIds.length > 0) {
          const { data: revProblems } = await supabase
            .from('problems')
            .select('id, title, difficulty, leetcode_slug, leetcode_url, source_type, source_id, step_name')
            .in('id', allRevisionIds);

          if (revProblems) {
            revisionQueue = revProblems.map(p => {
              const prog = (progressData || []).find(pr => pr.problem_id === p.id);
              return {
                ...p,
                status: prog?.status || 'not_started',
                solved_at: prog?.solved_at,
                isStale: staleProblemIds.includes(p.id) && !revisionProblemIds.includes(p.id)
              };
            });
          }
        }

        // 5. Resume Learning - find top 3 sources by recent activity
        const solvedProblemIds = solvedEntries.map(e => e.problem_id);
        let resumeTracks = [];

        if (solvedProblemIds.length > 0) {
          // Get recently solved problems with source info
          const recentSolved = solvedEntries
            .filter(e => e.solved_at)
            .sort((a, b) => new Date(b.solved_at) - new Date(a.solved_at))
            .slice(0, 50);

          const recentProbIds = recentSolved.map(e => e.problem_id);
          const { data: recentProbs } = await supabase
            .from('problems')
            .select('id, source_type, source_id')
            .in('id', recentProbIds);

          if (recentProbs) {
            // Group by source_id and find most recently active
            const sourceActivity = {};
            recentProbs.forEach(p => {
              const entry = recentSolved.find(s => s.problem_id === p.id);
              if (!sourceActivity[p.source_id] || new Date(entry?.solved_at) > new Date(sourceActivity[p.source_id].lastActive)) {
                sourceActivity[p.source_id] = {
                  source_id: p.source_id,
                  source_type: p.source_type,
                  lastActive: entry?.solved_at
                };
              }
            });

            const topSources = Object.values(sourceActivity)
              .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
              .slice(0, 3);

            // Resolve source names
            for (const src of topSources) {
              let trackInfo = { name: 'Unknown', slug: '', icon: 'sheet' };

              if (src.source_type === 'sheet') {
                const { data: sheetData } = await supabase
                  .from('sheets')
                  .select('name, slug, creator')
                  .eq('id', src.source_id)
                  .single();

                if (sheetData) {
                  trackInfo = { name: sheetData.name, slug: `/sheet/${sheetData.slug}`, icon: 'sheet', creator: sheetData.creator };
                } else {
                  // Try local fallback
                  const local = sheetsData.find(s => `local-sheet-${s.slug}` === src.source_id);
                  if (local) trackInfo = { name: local.sheet_name, slug: `/sheet/${local.slug}`, icon: 'sheet', creator: local.creator_name };
                }
              } else {
                const { data: trackData } = await supabase
                  .from('company_tracks')
                  .select('id, role, companies(name, slug)')
                  .eq('id', src.source_id)
                  .single();

                if (trackData) {
                  trackInfo = {
                    name: `${trackData.companies?.name} - ${trackData.role}`,
                    slug: `/company/${trackData.companies?.slug}/${trackData.id}`,
                    icon: 'company'
                  };
                }
              }

              // Count progress for this source
              const { count: sourceTotal } = await supabase
                .from('problems')
                .select('*', { count: 'exact', head: true })
                .eq('source_id', src.source_id);

              const { count: sourceSolved } = await supabase
                .from('problems')
                .select('*', { count: 'exact', head: true })
                .eq('source_id', src.source_id)
                .in('id', solvedProblemIds);

              resumeTracks.push({
                ...trackInfo,
                source_id: src.source_id,
                source_type: src.source_type,
                lastActive: src.lastActive,
                total: sourceTotal || 0,
                solved: sourceSolved || 0,
                percentage: sourceTotal > 0 ? Math.round((sourceSolved / sourceTotal) * 100) : 0
              });
            }
          }
        }

        // If no resume tracks yet, suggest popular ones from local data
        if (resumeTracks.length === 0) {
          resumeTracks = [
            { name: "Strivers A2Z DSA Sheet", slug: '/sheet/strivers-a2z', icon: 'sheet', creator: 'Striver', total: 462, solved: 0, percentage: 0 },
            { name: "NeetCode 150", slug: '/sheet/neetcode-150', icon: 'sheet', creator: 'NeetCode', total: 150, solved: 0, percentage: 0 },
            { name: "Google Interview Prep", slug: '/companies', icon: 'company', total: 0, solved: 0, percentage: 0 }
          ];
        }

        setDsaStats({
          totalSolved: solvedEntries.length,
          totalProblems: totalProblems || 0,
          streak,
          revisionQueue,
          resumeTracks,
        });

      } catch (err) {
        console.warn('Error fetching DSA overview from Supabase:', err);
      } finally {
        setDsaLoading(false);
      }
    }

    fetchDSAOverview();
  }, [user]);

  // ─── Existing handlers (unchanged) ───
  const handleCopySquadCode = () => {
    const codeToCopy = dashboardData.squadInfo?.code || dashboardData.squadInfo?.id;
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateSquad = async (squadName) => {
    const res = await axios.post(`${API_BASE_URL}/squads/create`, { name: squadName }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchDashboard(true);
    return res.data;
  };

  const handleJoinSquad = async (squadCode) => {
    const res = await axios.post(`${API_BASE_URL}/squads/join`, { squadCode }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchDashboard(true);
    return res.data;
  };

  const handleLeaveSquad = async () => {
    const res = await axios.post(`${API_BASE_URL}/squads/leave`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchDashboard(true);
    return res.data;
  };

  const handleSaveTarget = async (newTarget) => {
    await axios.put(`${API_BASE_URL}/settings/target`, { target: newTarget }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDailyTarget(newTarget);
    await fetchDashboard(true);
  };

  const handleAddFriend = async (payload) => {
    const requestData = typeof payload === 'string'
      ? { friendIdentifier: payload }
      : payload;

    const response = await axios.post(`${API_BASE_URL}/friends/add`, requestData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchDashboard(true);
    return response.data;
  };

  const handleRemoveFriend = async (friendId) => {
    setRemovingId(friendId);
    try {
      await axios.delete(`${API_BASE_URL}/friends/remove/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchDashboard(true);
    } catch (err) { alert(err.response?.data?.error || 'Failed to remove friend.'); }
    finally { setRemovingId(null); }
  };

  const handleNavigate = (section) => {
    setActiveSection(section);
  };

  // ── Derived DSA values ──
  const overallPercentage = dsaStats.totalProblems > 0
    ? Math.round((dsaStats.totalSolved / dsaStats.totalProblems) * 100)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      {/* Left Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onEditTarget={() => setIsEditModalOpen(true)}
        onOpenSquadModal={() => setIsSquadModalOpen(true)}
        platformTotal={yourPlatformTotal}
      />

      {/* Main Content */}
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          onRefresh={() => fetchDashboard(true)}
          refreshing={refreshing}
          platformTotal={yourPlatformTotal}
        />

        {/* Main Scrollable Area */}
        <main className="flex-1 p-6 overflow-y-auto animate-fadeIn">

          {/* Greeting & Squad Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                Hey {name.split(' ')[0]}! <span className="text-2xl">👋</span>
              </h2>
              <p className="text-sm text-[#8b949e] mt-0.5">
                {yourTodayCount === 0
                  ? "Time to start grinding — your squad is counting on you!"
                  : yourTodayCount >= dailyTarget
                    ? "Target smashed! You're leading by example today. 🔥"
                    : `${dailyTarget - yourTodayCount} more to hit today's target. Let's go! 💪`
                }
              </p>
            </div>

            {/* Squad Banner Card */}
            {dashboardData.squadInfo && (
              <div className="dash-card px-4 py-3 border border-[#30363d] bg-[#161b22] flex items-center gap-3.5 flex-shrink-0">
                <div className="p-2 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">Squad:</span>
                    <span className="text-sm font-extrabold text-white">{dashboardData.squadInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-mono text-[#22c55e] font-bold">
                      {dashboardData.squadInfo.code || dashboardData.squadInfo.id}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySquadCode}
                      className="px-2 py-0.5 bg-[#21262d] hover:bg-[#30363d] text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors border border-[#30363d]"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied' : 'Copy ID'}</span>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSquadModalOpen(true)}
                  className="ml-2 px-3 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Squad Options</span>
                </button>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ██  NEW: DSA PROGRESS OVERVIEW  ██ */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            {/* DSA Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Overall Completion */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/30 via-[#161b22] to-[#161b22] border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-5 shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
                <ProgressRing percentage={overallPercentage} size={72} strokeWidth={7} />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Overall Progress</p>
                  <p className="text-2xl font-extrabold text-white">{dsaStats.totalSolved}<span className="text-sm text-[#8b949e] font-medium"> / {dsaStats.totalProblems}</span></p>
                  <p className="text-[11px] text-[#6e7681]">Problems Solved</p>
                </div>
              </div>

              {/* Streak */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-950/20 via-[#161b22] to-[#161b22] border border-orange-500/20 rounded-2xl p-5 flex items-center gap-5 shadow-xl">
                <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/5 rounded-full -translate-y-6 translate-x-6 blur-2xl" />
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-7 h-7 text-orange-500" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-orange-400/80 uppercase tracking-widest">Current Streak</p>
                  <p className="text-2xl font-extrabold text-white">{dsaStats.streak}<span className="text-sm text-[#8b949e] font-medium"> days</span></p>
                  <p className="text-[11px] text-[#6e7681]">{dsaStats.streak > 0 ? 'Keep it going! 🔥' : 'Start today!'}</p>
                </div>
              </div>

              {/* Revision Queue Count */}
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-950/20 via-[#161b22] to-[#161b22] border border-amber-500/20 rounded-2xl p-5 flex items-center gap-5 shadow-xl">
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full -translate-y-6 translate-x-6 blur-2xl" />
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-7 h-7 text-amber-400" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">Needs Revision</p>
                  <p className="text-2xl font-extrabold text-white">{dsaStats.revisionQueue.length}</p>
                  <p className="text-[11px] text-[#6e7681]">Problems to revisit</p>
                </div>
              </div>

              {/* Active Tracks */}
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/20 via-[#161b22] to-[#161b22] border border-indigo-500/20 rounded-2xl p-5 flex items-center gap-5 shadow-xl">
                <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full -translate-y-6 translate-x-6 blur-2xl" />
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-7 h-7 text-indigo-400" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest">Active Tracks</p>
                  <p className="text-2xl font-extrabold text-white">{dsaStats.resumeTracks.length}</p>
                  <p className="text-[11px] text-[#6e7681]">In progress</p>
                </div>
              </div>
            </motion.div>

            {/* Resume Learning + Revision Queue Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 mb-6">
              {/* Resume Learning */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-[#21262d] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Resume Learning</h3>
                  </div>
                  <span className="text-[10px] text-[#6e7681] font-medium">Your top 3 active tracks</span>
                </div>

                <div className="p-4 space-y-3">
                  {dsaLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                    </div>
                  ) : dsaStats.resumeTracks.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <BookOpen className="w-8 h-8 text-[#6e7681] mx-auto" />
                      <p className="text-xs text-[#8b949e]">Start solving problems to see your active tracks here.</p>
                      <button
                        onClick={() => navigate('/sheets')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Browse DSA Sheets
                      </button>
                    </div>
                  ) : (
                    dsaStats.resumeTracks.map((track, idx) => (
                      <motion.div
                        key={track.source_id || idx}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => navigate(track.slug)}
                        className="group relative bg-[#0d1117] hover:bg-[#161b22] border border-[#30363d] hover:border-emerald-500/30 rounded-xl p-4 cursor-pointer transition-all duration-300 flex items-center justify-between gap-4 hover:shadow-lg hover:shadow-emerald-500/5"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                            track.icon === 'company'
                              ? 'bg-indigo-500/10 border-indigo-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/20'
                          }`}>
                            {track.icon === 'company'
                              ? <Building2 className="w-5 h-5 text-indigo-400" />
                              : <FileCode2 className="w-5 h-5 text-emerald-400" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white group-hover:text-emerald-400 truncate transition-colors">
                              {track.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {track.creator && (
                                <span className="text-[10px] text-[#8b949e]">by {track.creator}</span>
                              )}
                              <span className="text-[10px] text-[#6e7681]">•</span>
                              <span className="text-[10px] text-emerald-400 font-semibold">{track.solved}/{track.total} solved</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Mini Progress Bar */}
                          <div className="w-20 hidden sm:block">
                            <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                                style={{ width: `${track.percentage}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-[#6e7681] mt-0.5 text-right font-mono">{track.percentage}%</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#6e7681] group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Revision Queue */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-[#21262d] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <RotateCcw className="w-4 h-4 text-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Revision Queue</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                    {dsaStats.revisionQueue.length} items
                  </span>
                </div>

                <div className="p-3 space-y-1.5 max-h-[340px] overflow-y-auto">
                  {dsaLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                    </div>
                  ) : dsaStats.revisionQueue.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs text-[#8b949e]">No problems need revision right now. Nice!</p>
                    </div>
                  ) : (
                    dsaStats.revisionQueue.map((prob, idx) => {
                      const leetcodeUrl = prob.leetcode_url || `https://leetcode.com/problems/${prob.leetcode_slug}/`;
                      return (
                        <motion.div
                          key={prob.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#0d1117] hover:bg-amber-950/10 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              prob.isStale ? 'bg-blue-400' : 'bg-amber-400'
                            }`} />
                            <div className="min-w-0">
                              <a
                                href={leetcodeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-[#e6edf3] hover:text-amber-300 truncate block transition-colors"
                              >
                                {prob.title}
                              </a>
                              <span className="text-[9px] text-[#6e7681]">
                                {prob.isStale ? '⏰ Solved >30 days ago' : '🔄 Marked for revision'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              prob.difficulty === 'Easy'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : prob.difficulty === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {prob.difficulty}
                            </span>
                            <a
                              href={leetcodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-white/5 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 text-[#6e7681] hover:text-white" />
                            </a>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ██  EXISTING: Leaderboard Section  ██ */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <div className="p-3.5 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e]">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-[#e6edf3]">Syncing LeetCode submissions...</p>
              <p className="text-xs text-[#6e7681]">Querying live data for your squad</p>
            </div>
          ) : error ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 dash-card p-8 max-w-md mx-auto text-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <h3 className="text-base font-bold text-white">Unable to Load Leaderboard</h3>
              <p className="text-xs text-[#8b949e]">{error}</p>
              <button onClick={() => fetchDashboard()} className="px-4 py-2 bg-[#22c55e] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 mt-2">
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Stats Cards Row */}
              <StatsCards
                stats={dashboardData.stats}
                dailyTarget={dailyTarget}
                onEditTarget={() => setIsEditModalOpen(true)}
              />

              {/* Leaderboard + Right Sidebar */}
              <div className="grid grid-cols-[1fr_320px] gap-4 mb-6" id="leaderboard-section">
                {/* Left: Leaderboard */}
                <LeaderboardTable
                  leaderboard={dashboardData.leaderboard}
                  dailyTarget={dailyTarget}
                  onRemoveFriend={handleRemoveFriend}
                  removingId={removingId}
                />
                {/* Right: Weekly Progress + Recent Activity */}
                <div className="flex flex-col gap-4">
                  <WeeklyProgress
                    yourTodayCount={yourTodayCount}
                    dailyTarget={dailyTarget}
                    platformTotal={yourPlatformTotal}
                    weeklyData={weeklyData}
                  />
                  <RecentActivity leaderboard={dashboardData.leaderboard} />
                </div>
              </div>

              {/* Bottom Row: Progress Chart + Motivational + Add Friend */}
              <div className="grid grid-cols-[1fr_320px] gap-4 mb-6">
                {/* Left: Progress Chart */}
                <ProgressChart yourTodayCount={yourTodayCount} dailyTarget={dailyTarget} weeklyData={weeklyData} />
                {/* Right: Motivational + Add Friend */}
                <div className="flex flex-col gap-4">
                  <MotivationalCard yourTodayCount={yourTodayCount} dailyTarget={dailyTarget} />
                  <div id="add-friend-section">
                    <AddFriend onAddFriend={handleAddFriend} />
                  </div>
                </div>
              </div>

              {/* GitHub-style All-Time Activity Heatmap */}
              <div className="mb-6">
                <ContributionHeatmap onWeeklyDataLoaded={(data) => setWeeklyData(data)} />
              </div>
            </>
          )}

          {/* Footer */}
          <div className="text-center py-6 border-t border-[#21262d] mt-4">
            <p className="text-xs text-[#6e7681] flex items-center justify-center gap-1.5">
              © {new Date().getFullYear()} GrindFam. Built for consistency. Built for the squad.
              <Heart className="w-3 h-3 text-purple-400 fill-purple-400" />
            </p>
          </div>
        </main>
      </div>

      {/* Edit Target Modal */}
      <EditTargetModal
        isOpen={isEditModalOpen}
        currentTarget={dailyTarget}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveTarget}
      />

      {/* Squad Manager Modal */}
      <SquadManagerModal
        isOpen={isSquadModalOpen}
        onClose={() => setIsSquadModalOpen(false)}
        squadInfo={dashboardData.squadInfo}
        onCreateSquad={handleCreateSquad}
        onJoinSquad={handleJoinSquad}
        onLeaveSquad={handleLeaveSquad}
      />
    </div>
  );
};

export default Dashboard;
