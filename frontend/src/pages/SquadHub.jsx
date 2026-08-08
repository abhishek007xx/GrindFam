import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSquadStore } from '../store/useSquadStore';
import useCommunityRealtime from '../hooks/useCommunityRealtime';
import useStreakEngine from '../hooks/useStreakEngine';
import useArenaMatchmaking from '../hooks/useArenaMatchmaking';
import { Loader2 } from 'lucide-react';

// Lazy load sub-modules
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

  // Active View Mode matching Stitch Screens: 'squads' (Squad Lounge & Presence), 'reviews' (Code Review Hub), 'leaderboard' (Squad Leaderboard), 'dms' (Direct Messages Hub), 'repo' (Squad Repository), 'arena' (1v1 Arena)
  const [activeTab, setActiveTab] = useState('squads');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewDMModalOpen, setIsNewDMModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeChannelName, setActiveChannelName] = useState('general');

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
  const currentUserAvatar = profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRiN5Y6x-nYTLEdWcKK7fLNkx4aUoSggmuqBGSnp87VTQab50U8TDo01QxEw3Y2olhSvtK5vM-pJR3BSLiqkZ5QHS3r7Pk0Y-wq__Kk_awktD8zPufvfhP5xj0t-pakhYLpuYFadlT4CCz1Wtz7zeuN1jwcy5Yk5-gN34fh80FSV7GD0sacD2__Kxt62BnSdeVTG4CVAN_zzYoyYB2jNaMpnHtvkcdRHJAQfQ-wtwyaH0fURKSccVl';

  return (
    <div className="bg-[#0D0D0D] text-on-surface min-h-screen flex flex-col font-body-md antialiased rounded-2xl border border-white/10 overflow-hidden shadow-2xl selection:bg-[#4cd7f6]/30">
      
      {/* ── STITCH HEADER & TOP NAVIGATION BAR (Screen 10625988f1344d9db9c9bf2e9d945f37) ── */}
      <header className="bg-surface/85 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-6 h-16 w-full sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="font-headline-lg text-2xl font-bold text-primary tracking-tight font-['Outfit'] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#EA5D3A] text-2xl">shield</span>
            <span>{activeSquad?.name || 'DSA Dream Team'}</span>
          </div>
          
          <nav className="hidden md:flex gap-4 items-center">
            <button
              onClick={() => setActiveTab('squads')}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono-label flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'squads'
                  ? 'bg-secondary-container/20 text-[#4cd7f6] border border-[#4cd7f6]/40 font-bold'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">groups</span>
              <span>Squad Lounge</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono-label flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-secondary-container/20 text-[#4cd7f6] border border-[#4cd7f6]/40 font-bold'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              <span>Code Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono-label flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-secondary-container/20 text-[#4cd7f6] border border-[#4cd7f6]/40 font-bold'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">leaderboard</span>
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveTab('arena')}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono-label flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'arena'
                  ? 'bg-secondary-container/20 text-[#4cd7f6] border border-[#4cd7f6]/40 font-bold'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">swords</span>
              <span>1v1 Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('repo')}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono-label flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'repo'
                  ? 'bg-secondary-container/20 text-[#4cd7f6] border border-[#4cd7f6]/40 font-bold'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">code</span>
              <span>Repository</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('dms')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono-label font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'dms'
                ? 'bg-[#03b5d3] text-white shadow-[0_0_12px_rgba(3,181,211,0.5)]'
                : 'bg-[#201f1f] text-[#4cd7f6] border border-[#4cd7f6]/30 hover:bg-[#2a2a2a]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
            <span>Direct Messages</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-[#201f1f] hover:bg-[#2a2a2a] text-xs font-mono-label text-white border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">{copiedCode ? 'check' : 'content_copy'}</span>
            <span>{copiedCode ? 'Copied' : activeSquad?.code || 'GRIND2026'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#EA5D3A] hover:brightness-110 text-white text-xs font-mono-label font-bold shadow-[0_0_10px_rgba(234,93,58,0.4)] transition-all cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Manage Squad</span>
          </button>
        </div>
      </header>

      {/* ── STITCH SCREEN 1: LIVE SQUAD PRESENCE BAR (Screen 10625988f1344d9db9c9bf2e9d945f37) ── */}
      <section className="bg-[#131313] border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">cell_tower</span>
            <h2 className="font-headline-md text-sm font-bold text-[#4cd7f6] uppercase tracking-wider font-['Outfit']">
              Live Squad Presence
            </h2>
          </div>
          <span className="font-mono-label text-xs text-[#A88A83]">
            {members.length || 1} Grinders Online
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide">
          {/* Current User Online Avatar Chip */}
          <div className="flex flex-col items-center gap-1.5 min-w-[80px] group cursor-pointer">
            <div className="relative w-10 h-10 rounded-full">
              <img
                src={currentUserAvatar}
                alt={currentUserName}
                className="w-full h-full rounded-full object-cover border-2 border-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-transform group-hover:scale-105"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0D0D0D]" />
            </div>
            <span className="font-mono-label text-[11px] text-white truncate max-w-[80px] text-center font-bold">
              {currentUserName} (You)
            </span>
          </div>

          {/* Squad Members Presence Chips */}
          {members.map((m, idx) => (
            <div key={m.id || idx} className="flex flex-col items-center gap-1.5 min-w-[80px] group cursor-pointer">
              <div className="relative w-10 h-10 rounded-full">
                <img
                  src={m.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.username || idx}`}
                  alt={m.username}
                  className="w-full h-full rounded-full object-cover border-2 border-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-transform group-hover:scale-105"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#F59E0B] border-2 border-[#0D0D0D]" />
              </div>
              <span className="font-mono-label text-[11px] text-[#e5e2e1] truncate max-w-[80px] text-center">
                {m.username || 'Member'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STITCH MAIN CONTENT CANVAS ── */}
      <main className="flex-1 p-6">
        <Suspense fallback={
          <div className="p-16 text-center bg-[#131313] rounded-2xl border border-white/10 space-y-3 animate-pulse">
            <Loader2 className="w-8 h-8 text-[#EA5D3A] animate-spin mx-auto" />
            <p className="text-xs font-mono-label text-[#A88A83]">Loading Stitch Module...</p>
          </div>
        }>
          {/* TAB 1: SQUAD LOUNGE (Stitch Screen 26eecffc494148fd8983b6bb0b5f1991) */}
          {activeTab === 'squads' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Contextual Sub-Nav */}
              <div className="lg:col-span-3 bg-[#131313] border border-white/10 rounded-xl p-4 space-y-4">
                <h3 className="font-headline-md text-sm font-bold text-white font-['Outfit']">Text Channels</h3>
                <ul className="space-y-1 font-mono-label text-xs">
                  {[
                    { id: 'general', label: 'general', icon: '#' },
                    { id: 'daily-wins', label: 'daily-wins', icon: 'emoji_events' },
                    { id: 'code-sharing', label: 'code-sharing', icon: 'terminal' },
                    { id: 'doubt-solver', label: 'doubt-solver', icon: 'help' },
                  ].map((ch) => (
                    <li key={ch.id}>
                      <button
                        onClick={() => setActiveChannelName(ch.id)}
                        className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                          activeChannelName === ch.id
                            ? 'bg-[#EA5D3A]/20 text-[#EA5D3A] border border-[#EA5D3A]/40 font-bold'
                            : 'text-[#A88A83] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{ch.icon}</span>
                        <span>#{ch.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="font-mono-label text-[10px] uppercase text-[#A88A83]">Auto-Assigned Roles</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-mono-label">
                      🎯 {currentUserTarget}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono-label">
                      🏆 Level {profile?.level || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Stream Canvas */}
              <div className="lg:col-span-9 bg-[#131313] border border-white/10 rounded-xl p-5 min-h-[550px]">
                <SquadChat />
              </div>
            </div>
          )}

          {/* TAB 2: CODE REVIEWS (Stitch Screen e0c235bf36d748d69bcbb87e8d8763c3) */}
          {activeTab === 'reviews' && (
            <div className="bg-[#131313] border border-white/10 rounded-xl p-5">
              <PeerCodeReviewQueue />
            </div>
          )}

          {/* TAB 3: LEADERBOARD (Stitch Screen 5490bd01bd5a46d999034819bea76eef) */}
          {activeTab === 'leaderboard' && (
            <div className="bg-[#131313] border border-white/10 rounded-xl p-5">
              <SquadLeaderboard />
            </div>
          )}

          {/* TAB 4: 1v1 ARENA */}
          {activeTab === 'arena' && (
            <div className="bg-[#131313] border border-white/10 rounded-xl p-5">
              <ArenaHub {...arenaMatchmaking} />
            </div>
          )}

          {/* TAB 5: SQUAD REPOSITORY (Stitch Screen 29934e147c6b41399e37f527f3d55634) */}
          {activeTab === 'repo' && (
            <div className="bg-[#131313] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-3xl">code</span>
                  <div>
                    <h3 className="font-headline-md text-lg font-bold text-white font-['Outfit']">Squad Code Repository</h3>
                    <p className="font-body-sm text-xs text-[#A88A83]">Starred problem notes and optimized code solutions saved by squad members</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#1c1b1b] border border-[#333333] rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Two Sum - Hash Map Optimization</span>
                    <span className="font-mono-label text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">C++</span>
                  </div>
                  <p className="text-xs text-[#A88A83]">Saved by {currentUserName} • 2 days ago</p>
                  <pre className="p-3 bg-[#0d0d0d] rounded text-xs font-mono-code text-[#4cd7f6] overflow-x-auto">
{`unordered_map<int, int> mp;
for (int i = 0; i < nums.size(); i++) {
    int diff = target - nums[i];
    if (mp.count(diff)) return {mp[diff], i};
    mp[nums[i]] = i;
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DIRECT MESSAGES HUB (Stitch Screen 072245e3558848129d397a0c858475cc & aacda9dd31514e93af440993050008e9) */}
          {activeTab === 'dms' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 bg-[#131313] border border-white/10 rounded-xl p-4 min-h-[500px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <h3 className="font-headline-md text-sm font-bold text-white flex items-center gap-2 font-['Outfit']">
                    <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">chat_bubble</span>
                    Direct Messages
                  </h3>
                  <button
                    onClick={() => setIsNewDMModalOpen(true)}
                    className="p-1.5 rounded bg-[#4cd7f6]/10 text-[#4cd7f6] text-xs font-mono-label font-bold border border-[#4cd7f6]/30 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>New DM</span>
                  </button>
                </div>
                <DMList />
              </div>

              <div className="lg:col-span-8 bg-[#131313] border border-white/10 rounded-xl p-5 min-h-[500px]">
                {activeDMThread ? (
                  <DMChat />
                ) : (
                  <div className="text-center py-24 space-y-4">
                    <span className="material-symbols-outlined text-[#4cd7f6] text-5xl opacity-60">forum</span>
                    <h4 className="font-headline-md text-lg font-bold text-white font-['Outfit']">Select a Chat or Start a New DM</h4>
                    <p className="font-body-sm text-xs text-[#A88A83] max-w-sm mx-auto">
                      Direct messaging for coders: share problem links, discuss solutions, and review code together in real-time.
                    </p>
                    <button
                      onClick={() => setIsNewDMModalOpen(true)}
                      className="px-4 py-2 rounded bg-[#03b5d3] hover:brightness-110 text-white text-xs font-mono-label font-bold shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Start Direct Message</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Suspense>
      </main>

      {/* Modals */}
      {isModalOpen && <SquadManagerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      {isNewDMModalOpen && <NewDMModal isOpen={isNewDMModalOpen} onClose={() => setIsNewDMModalOpen(false)} />}
    </div>
  );
}
