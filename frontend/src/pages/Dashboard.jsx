import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { companiesData, sheetsData } from '../lib/dataFallback';
import { useAuth } from '../context/AuthContext';
import StatsCards from '../components/StatsCards';
import LeaderboardTable from '../components/LeaderboardTable';
import WeeklyProgress from '../components/WeeklyProgress';
import RecentActivity from '../components/RecentActivity';
import ProgressChart, { MotivationalCard } from '../components/ProgressChart';
import AddFriend from '../components/AddFriend';
import FriendsList from '../components/FriendsList';
import EditTargetModal from '../components/EditTargetModal';
import SquadManagerModal from '../components/SquadManagerModal';
import ContributionHeatmap from '../components/ContributionHeatmap';
import InterviewTimelineTracker from '../components/InterviewTimelineTracker';
import DailyMicroGoals from '../components/dashboardZones/DailyMicroGoals';
import ProblemAnalytics from '../components/dashboardZones/ProblemAnalytics';
import SpacedRepetitionVault from '../components/dashboardZones/SpacedRepetitionVault';
import ContestsGamification from '../components/dashboardZones/ContestsGamification';
import {
  Loader2, AlertCircle, RefreshCw, Heart, Shield, Copy, Check, Users,
  Flame, ArrowRight, RotateCcw, BookOpen, Building2, FileCode2,
  Target, TrendingUp, Zap, Clock, ChevronRight, ExternalLink, Sparkles
} from 'lucide-react';

import { API_BASE_URL } from '../config/api';

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
  const { token, profile, user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

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

  const [socialTab, setSocialTab] = useState(() => {
    return tabParam && ['leaderboard', 'squad', 'friends', 'addFriend'].includes(tabParam)
      ? tabParam
      : 'leaderboard';
  });

  useEffect(() => {
    if (tabParam && ['leaderboard', 'squad', 'friends', 'addFriend'].includes(tabParam)) {
      setSocialTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    setSocialTab(newTab);
    setSearchParams({ tab: newTab });
  };
  const [weeklyData, setWeeklyData] = useState([]);
  const [removingId, setRemovingId] = useState(null);

  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const yourTodayCount = dashboardData.stats?.yourTodayCount || 0;
  const yourPlatformTotal = dashboardData.stats?.yourPlatformTotal || 0;

  // ─── Leaderboard API fetch ───
  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (!token) {
      if (!authLoading) setLoading(false);
      return;
    }
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
  }, [token, authLoading]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ─── Manual Force Sync LeetCode Submissions ───
  const handleManualSyncLeetCode = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/dashboard/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      if (response.data?.dailyTarget) setDailyTarget(response.data.dailyTarget);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to sync LeetCode data.');
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  // Handle URL search params for tab switching & smooth scrolling (?tab=leaderboard|friends|addFriend|squad)
  useEffect(() => {
    const tab = searchParams.get('tab');
    const scrollToParam = searchParams.get('scrollTo');

    if (tab && ['leaderboard', 'squad', 'friends', 'addFriend'].includes(tab)) {
      setSocialTab(tab);
    }
    if (scrollToParam) {
      setTimeout(() => {
        const el = document.getElementById(scrollToParam);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [searchParams]);

  // Handle 1-click Join Squad from URL params (?joinSquad=CODE)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('joinSquad');
    if (joinCode && token) {
      handleJoinSquad(joinCode).then(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }).catch(console.error);
    }
  }, [token]);

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



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="space-y-8 animate-fadeIn">

          {/* Greeting Header with Prominent Sync Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#F3F4F6] dark:text-[#F3F4F6] light:text-slate-900">
                Hey {name.split(' ')[0]}! 👋
              </h2>
              <p className="text-sm text-[#9CA3AF] dark:text-[#9CA3AF] light:text-slate-600 mt-0.5">
                {yourTodayCount === 0
                  ? "Time to start grinding — your squad is counting on you!"
                  : yourTodayCount >= dailyTarget
                    ? "Target smashed! You're leading by example today."
                    : `${dailyTarget - yourTodayCount} more to hit today's target. Keep grinding!`
                }
              </p>
            </div>

            <button
              onClick={handleManualSync}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EA5D3A] hover:bg-[#F2633F] text-white font-bold text-xs shadow-md shadow-[#EA5D3A]/20 transition-all disabled:opacity-50 flex-shrink-0 cursor-pointer border border-orange-400/30"
              title="Sync latest submissions from LeetCode"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing LeetCode...' : 'Sync LeetCode Data'}</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ██  EXISTING: Leaderboard Section  ██ */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <div className="p-3.5 rounded-2xl bg-[#EA5D3A]/10 border border-[#EA5D3A]/20 text-[#EA5D3A]">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-[#e6edf3] dark:text-[#e6edf3] light:text-slate-900">Loading Dashboard...</p>
              <p className="text-xs text-[#6e7681] dark:text-[#6e7681] light:text-slate-600">Fetching your progress and squad stats</p>
            </div>
          ) : error ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 dash-card p-8 max-w-md mx-auto text-center">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <h3 className="text-base font-bold text-white">Unable to Load Leaderboard</h3>
              <p className="text-xs text-[#8b949e]">{error}</p>
              <button onClick={() => fetchDashboard()} className="px-4 py-2 bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] hover:from-[#D84C2A] hover:to-[#EA5D3A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 mt-2 shadow-md shadow-[#EA5D3A]/20">
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Zone 1: Daily Focus & Actionable Targets */}
              <div className="space-y-6 mb-8">
                <StatsCards
                  stats={dashboardData.stats}
                  dailyTarget={dailyTarget}
                  onEditTarget={() => setIsEditModalOpen(true)}
                  onSyncLeetCode={handleManualSyncLeetCode}
                  refreshing={refreshing}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <InterviewTimelineTracker totalTrackProblems={100} solvedCount={yourTodayCount} />
                  <DailyMicroGoals onXPEarned={(xp) => console.log('XP Earned:', xp)} />
                </div>
              </div>

              {/* Zone 2: Deep Problem-Solving Analytics */}
              <div className="mb-8 space-y-4">
                <div className="border-b border-[#27272A] dark:border-[#27272A] light:border-slate-200 pb-2">
                  <h2 className="text-lg font-bold text-zinc-100 dark:text-zinc-100 light:text-slate-900 tracking-tight">Zone 2: Deep Problem-Solving Analytics</h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-slate-600">Difficulty breakdown, acceptance ratio, AI weakness alerts & pattern mastery</p>
                </div>
                <ProblemAnalytics stats={dashboardData.stats} />
              </div>

              {/* Zone 3: Revision, Retention & Sheet Tracking */}
              <div className="mb-8 space-y-4">
                <div className="border-b border-[#27272A] dark:border-[#27272A] light:border-slate-200 pb-2">
                  <h2 className="text-lg font-bold text-zinc-100 dark:text-zinc-100 light:text-slate-900 tracking-tight">Zone 3: Revision, Retention & Sheet Tracking</h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-slate-600">Spaced repetition queue, DSA sheet progress & code vault bookmarks</p>
                </div>
                <SpacedRepetitionVault />
              </div>

              {/* Zone 4: Social Drive, Contests & Gamification */}
              <div className="mb-8 space-y-4">
                <div className="border-b border-[#27272A] dark:border-[#27272A] light:border-slate-200 pb-2">
                  <h2 className="text-lg font-bold text-zinc-100 dark:text-zinc-100 light:text-slate-900 tracking-tight">Zone 4: Social Drive, Contests & Gamification</h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-slate-600">Contest rating curve, XP level badges, live calendar & squad standings</p>
                </div>

                <ContestsGamification platformTotal={yourPlatformTotal} />

                {/* Social Category Hub Navigation */}
                <div className="dash-card p-3 flex flex-wrap items-center justify-between gap-3 bg-[#121212] border border-[#27272A] rounded-xl mt-4">
                  <div className="flex flex-wrap items-center gap-2 bg-[#09090B] p-1 rounded-lg border border-[#27272A]">
                    <button
                      onClick={() => handleTabChange('leaderboard')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        socialTab === 'leaderboard'
                          ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>Leaderboard</span>
                    </button>

                    <button
                      onClick={() => handleTabChange('squad')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        socialTab === 'squad'
                          ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>Squad Hub</span>
                    </button>

                    <button
                      onClick={() => handleTabChange('friends')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        socialTab === 'friends'
                          ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>Friends ({dashboardData.stats?.totalFriends || 0})</span>
                    </button>

                    <button
                      onClick={() => handleTabChange('addFriend')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        socialTab === 'addFriend'
                          ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>Add Friend</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSquadModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#EA5D3A]" /> Squad Options
                    </button>
                  </div>
                </div>

                {/* Active Social Tab View */}
                {socialTab === 'leaderboard' && (
                  <div className="grid-dashboard-main mb-6" id="leaderboard-section">
                    <LeaderboardTable
                      leaderboard={dashboardData.leaderboard}
                      dailyTarget={dailyTarget}
                      onRemoveFriend={handleRemoveFriend}
                      removingId={removingId}
                    />
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
                )}

                {socialTab === 'squad' && (
                  <div className="space-y-6 mb-6">
                    <div className="dash-card p-6 border border-[#27272A] bg-[#121212] relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-5 h-5 text-[#EA5D3A]" />
                            <span className="text-xs font-bold uppercase text-[#EA5D3A] tracking-wider">Your Active Squad</span>
                          </div>
                          <h2 className="text-2xl font-bold text-white tracking-tight">{dashboardData.squadInfo?.name || "Global Squad"}</h2>
                          <p className="text-xs text-zinc-400 mt-1">
                            Squad Code: <span className="font-mono text-[#EA5D3A] font-bold">{dashboardData.squadInfo?.code || "N/A"}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleCopySquadCode}
                            className="px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-bold flex items-center gap-2 border border-[#27272A] transition-all"
                          >
                            {copiedCode ? <Check className="w-4 h-4 text-[#EA5D3A]" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedCode ? 'Code Copied!' : 'Copy Squad Code'}</span>
                          </button>

                          <button
                            onClick={() => setIsSquadModalOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-[#EA5D3A] hover:bg-[#F2704E] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                          >
                            <Users className="w-4 h-4" /> Manage Squad
                          </button>
                        </div>
                      </div>
                    </div>

                    <LeaderboardTable
                      leaderboard={dashboardData.leaderboard}
                      dailyTarget={dailyTarget}
                      onRemoveFriend={handleRemoveFriend}
                      removingId={removingId}
                    />
                  </div>
                )}

                {socialTab === 'friends' && (
                  <div className="space-y-6 mb-6">
                    <FriendsList
                      token={token}
                      onRemoveFriend={handleRemoveFriend}
                      removingId={removingId}
                      onOpenAddFriend={() => handleTabChange('addFriend')}
                    />
                  </div>
                )}

                {socialTab === 'addFriend' && (
                  <div className="mb-6 max-w-2xl mx-auto" id="add-friend-section">
                    <AddFriend onAddFriend={handleAddFriend} />
                  </div>
                )}

                {/* GitHub-style Heatmap */}
                <div className="mb-6">
                  <ContributionHeatmap onWeeklyDataLoaded={(data) => setWeeklyData(data)} />
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="text-center py-6 border-t border-[#21262d] mt-4">
            <p className="text-xs text-[#6e7681] flex items-center justify-center gap-1.5">
              © {new Date().getFullYear()} GrindFam. Built for consistency. Built for the squad.
              <Heart className="w-3 h-3 text-[#EA5D3A] fill-[#EA5D3A]" />
            </p>
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
