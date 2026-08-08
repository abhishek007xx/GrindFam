import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSquadStore } from '../store/useSquadStore';
import useCommunityRealtime from '../hooks/useCommunityRealtime';
import {
  MessageSquare, Code, Trophy, Swords, Send, Shield, Users, Plus,
  Copy, Check, Sparkles, Flame, Circle, Zap, RefreshCw, ChevronRight,
  UserPlus, Hash, MessageCircle, AlertCircle, Loader2
} from 'lucide-react';
import useStreakEngine from '../hooks/useStreakEngine';
import useArenaMatchmaking from '../hooks/useArenaMatchmaking';

// Lazy load community sub-modules
const ArenaHub = lazy(() => import('../components/community/ArenaHub'));
const PeerCodeReviewQueue = lazy(() => import('../components/community/PeerCodeReviewQueue'));
const SquadChat = lazy(() => import('../components/squad/SquadChat'));
const SquadLeaderboard = lazy(() => import('../components/squad/SquadLeaderboard'));
const SquadSettings = lazy(() => import('../components/squad/SquadSettings'));
const SquadManagerModal = lazy(() => import('../components/SquadManagerModal'));
const DMChat = lazy(() => import('../components/squad/DMChat'));
const DMList = lazy(() => import('../components/squad/DMList'));
const NewDMModal = lazy(() => import('../components/squad/NewDMModal'));

export default function SquadHub() {
  const { session, profile } = useAuth();
  const {
    mySquads, activeSquad, activeChannel, activeDMThread, members, loading,
    loadMySquads, fetchCommunitySquads, loadDMThreads, setActiveSquad, setActiveChannel,
    joinByCode
  } = useSquadStore();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'codereview', 'leaderboard', 'arena', 'dms'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewDMModalOpen, setIsNewDMModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const streakEngine = useStreakEngine(session?.user?.id);
  const arenaMatchmaking = useArenaMatchmaking(session?.user?.id);

  useEffect(() => {
    loadMySquads();
    fetchCommunitySquads();
    loadDMThreads();
  }, [loadMySquads, fetchCommunitySquads, loadDMThreads]);

  useCommunityRealtime({
    squadId: activeSquad?.id,
    dmThreadId: activeDMThread?.id,
    onSquadMessage: (newMsg) => {
      useSquadStore.getState().addOptimisticMessage(newMsg);
    },
    onDMMessage: (newDMMsg) => {
      useSquadStore.getState().addOptimisticDMMessage(newDMMsg);
    }
  });

  const handleCopyCode = () => {
    if (!activeSquad?.code) return;
    navigator.clipboard.writeText(activeSquad.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentUserName = profile?.name || session?.user?.email?.split('@')[0] || 'Grinder';
  const currentUserTarget = profile?.target_company || profile?.targetCompany || 'SDE Target';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-fadeIn pb-12 font-sans">
      {/* ── 1. HIGH-FIDELITY COMMUNITY TOP BANNER & PRESENCE STRIP ── */}
      <div className="dash-card bg-[#18181A] border border-[#2C2C32] rounded-2xl p-5 shadow-xl relative overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#EA5D3A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          {/* Squad Title & Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EA5D3A] to-[#F2704E] p-0.5 shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-[#18181A] rounded-[14px] flex items-center justify-center text-[#EA5D3A]">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {activeSquad?.name || 'GrindFam Global Squad'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold tracking-wide uppercase">
                  Elite Cohort
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-3 flex-wrap">
                <span>Squad Code: <strong className="font-mono text-[#EA5D3A]">{activeSquad?.code || 'GRIND2026'}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Circle className="w-2 h-2 fill-emerald-400 animate-pulse" />
                  {members.length || 1} Active Grinders Online
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 rounded-xl bg-[#242428] hover:bg-[#2C2C32] text-zinc-200 text-xs font-bold flex items-center gap-2 border border-[#333338] transition-all cursor-pointer"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#EA5D3A]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Join / Create Squad</span>
            </button>
          </div>
        </div>

        {/* Live Squad Presence Strip */}
        <div className="mt-4 pt-4 border-t border-[#2A2A30] flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex-shrink-0">
            Live Squad Status:
          </span>

          <div className="flex items-center gap-2 flex-nowrap">
            {/* Current User Status Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#222226] border border-cyan-500/30 flex-shrink-0">
              <div className="relative w-6 h-6 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0">
                {currentUserName.slice(0, 2).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#18181A]" />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-bold text-white truncate">{currentUserName} (You)</p>
                <p className="text-[9px] text-cyan-400 font-semibold truncate">🟢 Online • {currentUserTarget}</p>
              </div>
            </div>

            {/* Squad Members Real-Time Status Chips */}
            {members.slice(0, 5).map((m, idx) => (
              <div key={m.id || idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#222226] border border-[#303036] flex-shrink-0">
                <div className="relative w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 text-[10px] font-bold flex-shrink-0">
                  {m.username?.slice(0, 2).toUpperCase() || 'GR'}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#18181A]" />
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-bold text-zinc-200 truncate">{m.username || 'Squad Member'}</p>
                  <p className="text-[9px] text-zinc-400 font-medium truncate">⚡ Solving Track</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. COMMUNITY SUB-NAVIGATION TABS BAR ── */}
      <div className="flex items-center gap-2 p-1.5 bg-[#18181A] border border-[#2C2C32] rounded-xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-[#EA5D3A] text-white shadow-md shadow-[#EA5D3A]/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Squad Chat Lounge</span>
        </button>

        <button
          onClick={() => setActiveTab('codereview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'codereview'
              ? 'bg-[#EA5D3A] text-white shadow-md shadow-[#EA5D3A]/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Code className="w-4 h-4 text-cyan-400" />
          <span>Peer Code Review Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'leaderboard'
              ? 'bg-[#EA5D3A] text-white shadow-md shadow-[#EA5D3A]/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Squad Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('arena')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'arena'
              ? 'bg-[#EA5D3A] text-white shadow-md shadow-[#EA5D3A]/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Swords className="w-4 h-4 text-purple-400" />
          <span>1v1 Arena Battle</span>
        </button>

        <button
          onClick={() => setActiveTab('dms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ml-auto ${
            activeTab === 'dms'
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-cyan-400" />
          <span>Direct Messages (DMs)</span>
        </button>
      </div>

      {/* ── 3. MAIN CANVAS WORKSPACE VIEW RENDER ── */}
      <Suspense fallback={
        <div className="p-12 text-center bg-[#18181A] border border-[#2C2C32] rounded-2xl space-y-3 animate-pulse">
          <Loader2 className="w-8 h-8 text-[#EA5D3A] animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Loading Community Workspace Module...</p>
        </div>
      }>
        {/* Tab 1: Squad Chat Lounge */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Chat Stream */}
            <div className="lg:col-span-8 bg-[#18181A] border border-[#2C2C32] rounded-2xl p-5 min-h-[550px] shadow-lg">
              <SquadChat />
            </div>

            {/* Right Sidebar: Active Squad Badges & Members */}
            <div className="lg:col-span-4 space-y-4">
              {/* Target & Role Badges Card */}
              <div className="bg-[#18181A] border border-[#2C2C32] rounded-2xl p-4 space-y-3 shadow-lg">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#EA5D3A]" />
                  Automated Track Badges
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[11px] font-bold">
                    🎯 Target: {currentUserTarget}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-bold">
                    🏆 Level {profile?.level || 1} Grinder
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-bold">
                    ⚡ DP Specialist
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                    🔥 14-Day Streak
                  </span>
                </div>
              </div>

              {/* Members Quick List */}
              <div className="bg-[#18181A] border border-[#2C2C32] rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Squad Members</h4>
                  <button
                    onClick={() => setIsNewDMModalOpen(true)}
                    className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> New DM
                  </button>
                </div>
                <div className="space-y-2">
                  {members.map((m, i) => (
                    <div key={m.id || i} className="p-2.5 rounded-xl bg-[#222226] border border-[#2F2F36] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {m.username?.slice(0, 2).toUpperCase() || 'GR'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{m.username || 'Member'}</p>
                          <p className="text-[9px] text-emerald-400 font-medium">Online</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('dms');
                        }}
                        className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-[10px] font-bold border border-cyan-500/20 transition-all"
                      >
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Peer Code Review Queue */}
        {activeTab === 'codereview' && (
          <div className="bg-[#18181A] border border-[#2C2C32] rounded-2xl p-5 shadow-lg">
            <PeerCodeReviewQueue />
          </div>
        )}

        {/* Tab 3: Squad Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="bg-[#18181A] border border-[#2C2C32] rounded-2xl p-5 shadow-lg">
            <SquadLeaderboard />
          </div>
        )}

        {/* Tab 4: Arena 1v1 Battle */}
        {activeTab === 'arena' && (
          <div className="bg-[#18181A] border border-[#2C2C32] rounded-2xl p-5 shadow-lg">
            <ArenaHub {...arenaMatchmaking} />
          </div>
        )}

        {/* Tab 5: Direct Messages (DMs) */}
        {activeTab === 'dms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 bg-[#18181A] border border-[#2C2C32] rounded-2xl p-4 min-h-[500px] shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2C2C32]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  Direct Messages
                </h3>
                <button
                  onClick={() => setIsNewDMModalOpen(true)}
                  className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New DM
                </button>
              </div>
              <DMList />
            </div>

            <div className="lg:col-span-8 bg-[#18181A] border border-[#2C2C32] rounded-2xl p-5 min-h-[500px] shadow-lg">
              {activeDMThread ? (
                <DMChat />
              ) : (
                <div className="text-center py-20 space-y-3">
                  <MessageSquare className="w-10 h-10 text-cyan-400 mx-auto opacity-60" />
                  <h4 className="text-base font-bold text-white">Select a Chat or Start a New DM</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Chat 1-on-1 with squad members, share code snippets, and review problem solutions together!
                  </p>
                  <button
                    onClick={() => setIsNewDMModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Start Direct Message
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Suspense>

      {/* Modals */}
      {isModalOpen && <SquadManagerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      {isNewDMModalOpen && <NewDMModal isOpen={isNewDMModalOpen} onClose={() => setIsNewDMModalOpen(false)} />}
    </div>
  );
}
