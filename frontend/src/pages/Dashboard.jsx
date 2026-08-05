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
          resumeTracks = [
            { name: "Striver's A2Z DSA Course Sheet", slug: '/sheet/striver-s-a2z-dsa-course-sheet', icon: 'sheet', creator: 'Striver', total: 499, solved: 0, percentage: 0 },
            { name: "NeetCode 150", slug: '/sheet/neetcode-150', icon: 'sheet', creator: 'NeetCode', total: 304, solved: 0, percentage: 0 },
            { name: "Google Interview Prep", slug: '/companies', icon: 'company', total: 0, solved: 0, percentage: 0 }
          ];

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
    <div className="page-shell">
      {/* Left Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onEditTarget={() => setIsEditModalOpen(true)}
        onOpenSquadModal={() => setIsSquadModalOpen(true)}
        platformTotal={yourPlatformTotal}
      />

      {/* Main Content */}
      <div className="page-content">
        {/* Top Navbar */}
        <Navbar
          onRefresh={() => fetchDashboard(true)}
          refreshing={refreshing}
          platformTotal={yourPlatformTotal}
        />

        {/* Main Scrollable Area */}
        <main className="page-main animate-fadeIn">

          {/* Greeting Header */}
          <div className="mb-6">
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
              <div className="grid-dashboard-main mb-6" id="leaderboard-section">
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
              <div className="grid-dashboard-main mb-6">
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
