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
import ShareCardModal from '../components/ShareCardModal';
import {
  Loader2, AlertCircle, RefreshCw, Heart, Shield, Copy, Check, Users,
  Flame, ArrowRight, RotateCcw, BookOpen, Building2, FileCode2,
  Target, TrendingUp, Zap, Clock, ChevronRight, ExternalLink, Sparkles, Share2, Eye, Trophy
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
          stroke="#2C2C2C" strokeWidth={strokeWidth} fill="transparent"
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
        {label && <span className="text-[9px] text-[#A3A3A3] mt-0.5">{label}</span>}
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
  const [activeMainTab, setActiveMainTab] = useState('overview'); // 'overview' | 'analytics' | 'vault' | 'contests' | 'social'
  const [dailyTarget, setDailyTarget] = useState(5);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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

      {/* Greeting Header */}
          <div className="relative overflow-hidden rounded-lg bg-[#1E1E1E] border border-[#333333] p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <img
              src="/logo.png"
              alt="GrindFam Mascot"
              className="absolute -bottom-8 -right-8 w-44 h-44 object-contain opacity-[0.05] grayscale pointer-events-none select-none"
            />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#262626] border border-[#333333] text-[#9CA3AF] text-xs font-medium mb-2">
                <Zap className="w-3.5 h-3.5 text-[#EA5D3A]" />
                <span>Today&apos;s Focus</span>
              </div>
              <h2 className="text-2xl font-bold text-[#F4F4F5] tracking-tight">
                Hey {name.split(' ')[0]}! 👋
              </h2>
              <p className="text-sm text-[#9CA3AF] mt-0.5">
                {yourTodayCount === 0
                  ? "Time to start grinding — your squad is counting on you!"
                  : yourTodayCount >= dailyTarget
                    ? "Target smashed! You're leading by example today."
                    : `${dailyTarget - yourTodayCount} more to hit today's target. Keep grinding!`
                }
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#EA5D3A] hover:bg-[#F2633F] text-white font-bold text-xs transition-all shadow-lg shadow-[#EA5D3A]/20 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Progress Card</span>
              </button>

              <button
                onClick={handleManualSyncLeetCode}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1F2937] hover:bg-[#EA5D3A]/15 border border-[#30363D] hover:border-[#EA5D3A]/50 text-[#9CA3AF] hover:text-[#EA5D3A] font-bold text-xs transition-all disabled:opacity-50 flex-shrink-0 cursor-pointer"
                title="Sync latest submissions from LeetCode"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
              </button>
            </div>
          </div>

      {/* Top-Level Navigation Tabs (Matches Reference Design) */}
      <div className="border-b border-[#30363D] mb-6 overflow-x-auto">
        <nav className="flex space-x-6 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'analytics', label: 'Analytics & Focus', icon: TrendingUp },
            { id: 'vault', label: 'Vault & Revision', icon: BookOpen },
            { id: 'contests', label: 'Contests & Leveling', icon: Trophy },
            { id: 'social', label: 'Squad & Social', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#EA5D3A] text-[#EA5D3A]'
                    : 'border-transparent text-[#9CA3AF] hover:text-white hover:border-zinc-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#EA5D3A]' : 'text-[#9CA3AF]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <div className="p-3.5 rounded-2xl bg-[#EA5D3A]/10 border border-[#EA5D3A]/20 text-[#EA5D3A]">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-[#F4F4F5]">Loading Dashboard...</p>
          <p className="text-xs text-[#737373]">Fetching your progress and squad stats</p>
        </div>
      ) : error ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 dash-card p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <h3 className="text-base font-bold text-white">Unable to Load Leaderboard</h3>
          <p className="text-xs text-[#A3A3A3]">{error}</p>
          <button onClick={() => fetchDashboard()} className="px-4 py-2 bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] hover:from-[#D84C2A] hover:to-[#EA5D3A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 mt-2 shadow-md shadow-[#EA5D3A]/20">
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* TAB 1: OVERVIEW (Main Dashboard Tab as requested) */}
          {activeMainTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Row 1: Slim Squad members & hit target row */}
              <StatsCards
                stats={dashboardData.stats}
                dailyTarget={dailyTarget}
                onEditTarget={() => setIsEditModalOpen(true)}
                onSyncLeetCode={handleManualSyncLeetCode}
                refreshing={refreshing}
              />

              {/* Row 2: Minimalist Leaderboard Table & Daily Micro Goals */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="leaderboard-section">
                <div className="xl:col-span-2">
                  <LeaderboardTable
                    leaderboard={dashboardData.leaderboard}
                    dailyTarget={dailyTarget}
                    onRemoveFriend={handleRemoveFriend}
                    removingId={removingId}
                  />
                </div>
                <div className="xl:col-span-1">
                  <DailyMicroGoals onXPEarned={(xp) => console.log('XP Earned:', xp)} />
                </div>
              </div>

              {/* Row 3: Weekly Progress Bar Chart & Recent Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <WeeklyProgress
                    yourTodayCount={yourTodayCount}
                    dailyTarget={dailyTarget}
                    platformTotal={yourPlatformTotal}
                    weeklyData={weeklyData}
                  />
                </div>
                <div className="xl:col-span-1">
                  <RecentActivity leaderboard={dashboardData.leaderboard} />
                </div>
              </div>

              {/* Row 4: All-Time Contribution Heatmap at the Bottom (Full Width, No Scrollbar) */}
              <div className="w-full">
                <ContributionHeatmap onWeeklyDataLoaded={(data) => setWeeklyData(data)} />
              </div>
            </div>
          )}

          {/* TAB 2: ANALYTICS & FOCUS */}
          {activeMainTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              <InterviewTimelineTracker totalTrackProblems={100} solvedCount={yourTodayCount} />
              <ProblemAnalytics stats={dashboardData.stats} />
            </div>
          )}

          {/* TAB 3: VAULT & REVISION */}
          {activeMainTab === 'vault' && (
            <div className="space-y-6 animate-fadeIn">
              <SpacedRepetitionVault />
            </div>
          )}

          {/* TAB 4: CONTESTS & LEVELING */}
          {activeMainTab === 'contests' && (
            <div className="space-y-6 animate-fadeIn">
              <ContestsGamification platformTotal={yourPlatformTotal} />
            </div>
          )}

          {/* TAB 5: SQUAD & SOCIAL */}
          {activeMainTab === 'social' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="dash-card p-6 border border-[#333333] bg-[#121212] relative overflow-hidden">
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
                      className="px-4 py-2.5 rounded-xl bg-[#262626] hover:bg-[#333333] text-white text-xs font-bold flex items-center gap-2 border border-[#333333] transition-all"
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

              {/* Active Social Tab View */}
              {socialTab === 'leaderboard' && (
                <LeaderboardTable
                  leaderboard={dashboardData.leaderboard}
                  dailyTarget={dailyTarget}
                  onRemoveFriend={handleRemoveFriend}
                  removingId={removingId}
                />
              )}

              {socialTab === 'squad' && (
                <LeaderboardTable
                  leaderboard={dashboardData.leaderboard}
                  dailyTarget={dailyTarget}
                  onRemoveFriend={handleRemoveFriend}
                  removingId={removingId}
                />
              )}

              {socialTab === 'friends' && (
                <FriendsList
                  token={token}
                  onRemoveFriend={handleRemoveFriend}
                  removingId={removingId}
                  onOpenAddFriend={() => handleTabChange('addFriend')}
                />
              )}

              {socialTab === 'addFriend' && (
                <div className="max-w-2xl mx-auto" id="add-friend-section">
                  <AddFriend onAddFriend={handleAddFriend} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

          {/* Footer */}
          <div className="text-center py-6 border-t border-[#2C2C2C] mt-4">
            <p className="text-xs text-[#737373] flex items-center justify-center gap-1.5">
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

      {/* Share Progress Card Modal */}
      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        userStats={{
          streak: dashboardData.stats?.currentStreak || (dashboardData.stats?.yourTodayCount > 0 ? 1 : 0),
          totalSolved: dashboardData.stats?.yourPlatformTotal || 0,
          readiness: 73,
          rankPercentile: 'Top 12%'
        }}
        userProfile={{
          name: name,
          username: profile?.username || name.toLowerCase().replace(/\s+/g, ''),
          avatar_url: profile?.avatar_url,
          targetCompany: dashboardData?.targetCompany || 'Google SDE-2'
        }}
      />
    </div>
  );
};

export default Dashboard;
