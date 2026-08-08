import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSquadStore } from '../store/useSquadStore';
import useCommunityRealtime from '../hooks/useCommunityRealtime';
import {
  MessageSquare, Code, Trophy, Swords, Send, Shield, Users, Plus,
  Copy, Check, Sparkles, Flame, Circle, Zap, RefreshCw, ChevronRight,
  UserPlus, Hash, MessageCircle, AlertCircle, Loader2, FolderGit2,
  Bookmark, Terminal, Layers, Star, ExternalLink, HelpCircle
} from 'lucide-react';
import useStreakEngine from '../hooks/useStreakEngine';
import useArenaMatchmaking from '../hooks/useArenaMatchmaking';

// Lazy load heavy modules
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

  // Active View Mode: 'lounge' (Squad Lounge), 'codereview' (Code Review Hub), 'leaderboard' (Squad Leaderboard), 'arena' (1v1 Arena), 'dms' (Direct Messages Hub), 'repo' (Squad Repository)
  const [activeView, setActiveView] = useState('lounge');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewDMModalOpen, setIsNewDMModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [channelFilter, setChannelFilter] = useState('general');

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
  const currentUserHandle = profile?.leetcode_username || profile?.username || 'user';
  const currentUserTarget = profile?.target_company || profile?.targetCompany || 'SDE Target';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-fadeIn pb-12 font-sans selection:bg-[#EA5D3A]/30">
      {/* ── 1. STITCH MCP TOP SQUAD BANNER & LIVE PRESENCE STRIP ── */}
      <div className="glass-panel bg-[#131313]/90 border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#EA5D3A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#06B6D4]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          {/* Squad Title & Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EA5D3A] to-[#06B6D4] p-0.5 shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-[#131313] rounded-[14px] flex items-center justify-center text-[#EA5D3A]">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white font-headline-xl tracking-tight">
                  {activeSquad?.name || 'DSA Dream Team'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EA5D3A]/15 text-[#EA5D3A] border border-[#EA5D3A]/30 text-[10px] font-mono-label font-bold tracking-wider uppercase">
                  ELITE COHORT
                </span>
              </div>
              <p className="text-xs text-[#A88A83] mt-1 flex items-center gap-3 flex-wrap">
                <span>Squad Code: <strong className="font-mono-code text-[#EA5D3A] font-bold">{activeSquad?.code || 'GRIND2026'}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Circle className="w-2 h-2 fill-emerald-400 animate-pulse" />
                  {members.length || 1} Grinders Online Now
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-[#201F1F] hover:bg-[#2A2A2A] text-white text-xs font-semibold flex items-center gap-2 border border-[#353534] transition-all cursor-pointer interactive-glow"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#A88A83]" />}
              <span>{copiedCode ? 'Code Copied!' : 'Copy Squad Code'}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#EA5D3A] hover:bg-[#F2633F] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#EA5D3A]/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Join / Create Squad</span>
            </button>
          </div>
        </div>

        {/* Live Presence Strip */}
        <div className="mt-4 pt-4 border-t border-[#2A2A2A] flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] font-mono-label font-bold uppercase tracking-wider text-[#A88A83] flex-shrink-0">
            Live Squad Status:
          </span>

          <div className="flex items-center gap-2 flex-nowrap">
            {/* Current User Status Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#201F1F] border border-cyan-500/30 flex-shrink-0">
              <div className="relative w-6 h-6 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0">
                {currentUserName.slice(0, 2).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#131313]" />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-bold text-white truncate">{currentUserName} (You)</p>
                <p className="text-[9px] text-cyan-400 font-semibold truncate">🟢 Online • {currentUserTarget}</p>
              </div>
            </div>

            {/* Squad Members Real-Time Status Chips */}
            {members.slice(0, 5).map((m, idx) => (
              <div key={m.id || idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#201F1F] border border-[#353534] flex-shrink-0">
                <div className="relative w-6 h-6 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {m.username?.slice(0, 2).toUpperCase() || 'GR'}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#131313]" />
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-bold text-[#E5E2E1] truncate">{m.username || 'Squad Member'}</p>
                  <p className="text-[9px] text-[#A88A83] font-medium truncate">⚡ Solving DP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. STITCH COMMUNITY SUB-NAVIGATION TAB BAR ── */}
      <div className="flex items-center gap-2 p-1.5 bg-[#131313] border border-white/10 rounded-xl overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveView('lounge')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'lounge'
              ? 'bg-[#EA5D3A] text-white shadow-md shadow-[#EA5D3A]/30'
              : 'text-[#A88A83] hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Squad Lounge</span>
        </button>

        <button
          onClick={() => setActiveView('codereview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'codereview'
              ? 'bg-[#EA5D3A] text-white shadow-md shadow-[#EA5D3A]/30'
              : 'text-[#A88A83] hover:text-white hover:bg-white/5'
          }`}
        >
          <Code className="w-4 h-4 text-cyan-400" />
          <span>Code Review Hub</span>
        </button>

        <button
          onClick={() => setActiveView('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'leaderboard'
              ? 'bg-[#EA5D3A] text-white shadow-md shadow-[#EA5D3A]/30'
              : 'text-[#A88A83] hover:text-white hover:bg-white/5'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Squad Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveView('arena')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'arena'
              ? 'bg-[#EA5D3A] text-white shadow-md shadow-[#EA5D3A]/30'
              : 'text-[#A88A83] hover:text-white hover:bg-white/5'
          }`}
        >
          <Swords className="w-4 h-4 text-purple-400" />
          <span>1v1 Arena Battle</span>
        </button>

        <button
          onClick={() => setActiveView('repo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'repo'
              ? 'bg-[#EA5D3A] text-white shadow-md shadow-[#EA5D3A]/30'
              : 'text-[#A88A83] hover:text-white hover:bg-white/5'
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-emerald-400" />
          <span>Squad Repository</span>
        </button>

        <button
          onClick={() => setActiveView('dms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ml-auto ${
            activeView === 'dms'
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
              : 'text-[#A88A83] hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-cyan-400" />
          <span>Direct Messages</span>
        </button>
      </div>

      {/* ── 3. STITCH MAIN VIEWS CANVAS RENDER ── */}
      <Suspense fallback={
        <div className="p-12 text-center glass-panel bg-[#131313] rounded-2xl space-y-3 animate-pulse">
          <Loader2 className="w-8 h-8 text-[#EA5D3A] animate-spin mx-auto" />
          <p className="text-xs text-[#A88A83]">Loading Stitch Community Workspace...</p>
        </div>
      }>
        {/* VIEW 1: Squad Lounge (Stitch Screen 26eecffc494148fd8983b6bb0b5f1991) */}
        {activeView === 'lounge' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Channel Sub-Nav */}
            <div className="lg:col-span-3 glass-panel bg-[#131313] border border-white/10 rounded-2xl p-4 space-y-4 shadow-xl">
              <h4 className="text-[11px] font-mono-label font-bold uppercase tracking-wider text-[#A88A83] px-2">Text Channels</h4>
              <div className="space-y-1">
                {[
                  { id: 'general', label: 'general', icon: <Hash className="w-3.5 h-3.5" /> },
                  { id: 'daily-wins', label: 'daily-wins', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
                  { id: 'code-reviews', label: 'code-reviews', icon: <Code className="w-3.5 h-3.5 text-cyan-400" /> },
                  { id: 'doubt-help', label: 'doubt-help', icon: <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setChannelFilter(ch.id)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      channelFilter === ch.id
                        ? 'bg-[#EA5D3A]/15 text-white border border-[#EA5D3A]/40 font-bold'
                        : 'text-[#A88A83] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {ch.icon}
                    <span>#{ch.label}</span>
                  </button>
                ))}
              </div>

              {/* Track Badges Widget */}
              <div className="pt-3 border-t border-[#2A2A2A] space-y-2">
                <p className="text-[10px] font-mono-label font-bold uppercase tracking-wider text-[#A88A83]">Auto-Assigned Roles</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold">
                    🎯 {currentUserTarget}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                    🏆 Level {profile?.level || 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                    ⚡ DP Specialist
                  </span>
                </div>
              </div>
            </div>

            {/* Center Squad Chat Stream */}
            <div className="lg:col-span-9 glass-panel bg-[#131313] border border-white/10 rounded-2xl p-5 min-h-[550px] shadow-xl">
              <SquadChat />
            </div>
          </div>
        )}

        {/* VIEW 2: Code Review Hub (Stitch Screen e0c235bf36d748d69bcbb87e8d8763c3) */}
        {activeView === 'codereview' && (
          <div className="glass-panel bg-[#131313] border border-white/10 rounded-2xl p-5 shadow-xl">
            <PeerCodeReviewQueue />
          </div>
        )}

        {/* VIEW 3: Squad Leaderboard (Stitch Screen 5490bd01bd5a46d999034819bea76eef) */}
        {activeView === 'leaderboard' && (
          <div className="glass-panel bg-[#131313] border border-white/10 rounded-2xl p-5 shadow-xl">
            <SquadLeaderboard />
          </div>
        )}

        {/* VIEW 4: 1v1 Arena Battle */}
        {activeView === 'arena' && (
          <div className="glass-panel bg-[#131313] border border-white/10 rounded-2xl p-5 shadow-xl">
            <ArenaHub {...arenaMatchmaking} />
          </div>
        )}

        {/* VIEW 5: Squad Repository (Stitch Screen 29934e147c6b41399e37f527f3d55634) */}
        {activeView === 'repo' && (
          <div className="glass-panel bg-[#131313] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-headline-md">Squad Code & Notes Repository</h3>
                  <p className="text-xs text-[#A88A83]">Starred problem notes and optimized code snippets saved by squad members</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('codereview')}
                className="px-3.5 py-2 rounded-xl bg-[#EA5D3A] hover:bg-[#F2633F] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Code to Repo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#1C1B1B] border border-[#353534] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    Two Sum - O(N) Hash Map Solution
                  </span>
                  <span className="text-[10px] font-mono-label px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    C++
                  </span>
                </div>
                <p className="text-xs text-[#A88A83]">Shared by <strong className="text-white">{currentUserName}</strong> • 2 days ago</p>
                <pre className="p-3 bg-[#0E0E0E] rounded-lg text-xs font-mono-code text-cyan-300 overflow-x-auto">
{`unordered_map<int, int> mp;
for (int i = 0; i < nums.size(); i++) {
    int diff = target - nums[i];
    if (mp.count(diff)) return {mp[diff], i};
    mp[nums[i]] = i;
}`}
                </pre>
              </div>

              <div className="p-4 bg-[#1C1B1B] border border-[#353534] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    LRU Cache - Doubly Linked List + Map
                  </span>
                  <span className="text-[10px] font-mono-label px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                    Python
                  </span>
                </div>
                <p className="text-xs text-[#A88A83]">Shared by <strong className="text-white">Squad Member</strong> • 4 days ago</p>
                <pre className="p-3 bg-[#0E0E0E] rounded-lg text-xs font-mono-code text-cyan-300 overflow-x-auto">
{`class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {} # key -> node`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: Direct Messages Hub (Stitch Screen 072245e3558848129d397a0c858475cc & aacda9dd31514e93af440993050008e9) */}
        {activeView === 'dms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 glass-panel bg-[#131313] border border-white/10 rounded-2xl p-4 min-h-[500px] shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2A2A2A]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-headline-md">
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  Direct Messages Hub
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

            <div className="lg:col-span-8 glass-panel bg-[#131313] border border-white/10 rounded-2xl p-5 min-h-[500px] shadow-xl">
              {activeDMThread ? (
                <DMChat />
              ) : (
                <div className="text-center py-24 space-y-4">
                  <MessageSquare className="w-12 h-12 text-cyan-400 mx-auto opacity-70 animate-bounce" />
                  <h4 className="text-lg font-bold text-white font-headline-md">Select a Chat or Start a 1-on-1 DM</h4>
                  <p className="text-xs text-[#A88A83] max-w-sm mx-auto">
                    Direct messaging for coders: share problem links, discuss solutions, and review code together in real-time.
                  </p>
                  <button
                    onClick={() => setIsNewDMModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
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
