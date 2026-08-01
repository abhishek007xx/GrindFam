import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
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
import { Loader2, AlertCircle, RefreshCw, Heart, Shield, Copy, Check, Users } from 'lucide-react';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};
const API_BASE_URL = getApiBaseUrl();


const Dashboard = () => {
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

  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const yourTodayCount = dashboardData.stats?.yourTodayCount || 0;
  const yourPlatformTotal = dashboardData.stats?.yourPlatformTotal || 0;

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
