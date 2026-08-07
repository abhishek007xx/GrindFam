import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSquadStore } from '../store/useSquadStore';
import useCommunityRealtime from '../hooks/useCommunityRealtime';
import CommunityNav from '../components/community/CommunityNav';
import TodayHabitHub from '../components/community/TodayHabitHub';
import {
  Hash, Volume2, ChevronDown, Plus, Settings, Users, Compass,
  Loader2, ExternalLink, Menu, X, Flame
} from 'lucide-react';
import { supabase } from '../supabase';
import useStreakEngine from '../hooks/useStreakEngine';
import useArenaMatchmaking from '../hooks/useArenaMatchmaking';

// Code Splitting & Lazy Loading Heavy Community Components
const ArenaHub = lazy(() => import('../components/community/ArenaHub'));
const PeerCodeReviewQueue = lazy(() => import('../components/community/PeerCodeReviewQueue'));
const SquadChat = lazy(() => import('../components/squad/SquadChat'));
const SquadLeaderboard = lazy(() => import('../components/squad/SquadLeaderboard'));
const SquadWeeklyChallenge = lazy(() => import('../components/squad/SquadWeeklyChallenge'));
const SquadSettings = lazy(() => import('../components/squad/SquadSettings'));
const SquadManagerModal = lazy(() => import('../components/SquadManagerModal'));
const DMChat = lazy(() => import('../components/squad/DMChat'));
const DMList = lazy(() => import('../components/squad/DMList'));
const NewDMModal = lazy(() => import('../components/squad/NewDMModal'));

const TEXT_CHANNELS = [
  { id: 'general', label: 'general', icon: <Hash className="w-4 h-4" /> },
  { id: 'code-sharing', label: 'code-sharing', icon: <Hash className="w-4 h-4" /> },
  { id: 'leaderboard', label: 'leaderboard', icon: <Hash className="w-4 h-4" /> },
  { id: 'weekly-challenge', label: 'weekly-challenge', icon: <Hash className="w-4 h-4" /> },
];

export default function SquadHub() {
  const { session, profile } = useAuth();
  const {
    mySquads, communitySquads, activeSquad, activeChannel, activeDMThread, members, loading,
    loadMySquads, fetchCommunitySquads, loadDMThreads, setActiveSquad, setActiveChannel,
    joinByCode, showMemberList, toggleMemberList
  } = useSquadStore();

  // Spatial Community Mode ('today', 'arena', 'squad')
  const [activeCommunityMode, setActiveCommunityMode] = useState('today');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewDMModalOpen, setIsNewDMModalOpen] = useState(false);
  const [channelSidebarOpen, setChannelSidebarOpen] = useState(false);

  // Use new centralized hooks
  const streakEngine = useStreakEngine(session?.user?.id);
  const arenaMatchmaking = useArenaMatchmaking(session?.user?.id);

  useEffect(() => {
    loadMySquads();
    fetchCommunitySquads();
    loadDMThreads();
  }, [loadMySquads, fetchCommunitySquads, loadDMThreads]);

  // Real-time Supabase Subscriptions Hook
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

  const isAdmin = activeSquad?.role === 'admin';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-fadeIn pb-12">
      {/* ── 1. Top Spatial Navigation Bar ── */}
      <CommunityNav
        activeMode={activeCommunityMode}
        onSelectMode={(mode) => setActiveCommunityMode(mode)}
        streakCount={streakEngine.currentStreak}
        isShieldActive={streakEngine.isShieldActive}
        pendingReviewCount={useSquadStore.getState().peerReviews?.filter(r => r.status === 'pending' && r.author_id !== session?.user?.id)?.length || 0}
      />

      {/* ── 2. Spatial Mode Canvas Render ── */}
      <Suspense fallback={
        <div className="p-12 text-center bg-[#121215] border border-[#27272A] rounded-xl space-y-3 animate-pulse">
          <Loader2 className="w-8 h-8 text-[#EA5D3A] animate-spin mx-auto" />
          <p className="text-xs text-[#9CA3AF]">Loading Community Module...</p>
        </div>
      }>
        {/* Mode A: Today & Habit Hub */}
        {activeCommunityMode === 'today' && (
          <TodayHabitHub
            userStreak={streakEngine.currentStreak}
            shieldsAvailable={streakEngine.shieldsAvailable}
            isShieldActive={streakEngine.isShieldActive}
            activeTrackName={activeSquad?.name || 'Google SDE Target Track'}
            dailyXp={250}
            targetXp={300}
            activeSquad={activeSquad}
            members={members}
            squadWeeklyProgress={{ current: 14, target: 25 }} // Mock for now
          />
        )}

        {/* Mode B: Arena & Battle PvP */}
        {activeCommunityMode === 'arena' && (
          <ArenaHub
            {...arenaMatchmaking}
          />
        )}

        {/* Mode C: Squad Cohort & Peer Review Space */}
        {activeCommunityMode === 'squad' && (
          <div className="space-y-6">
            {/* Squad Active Workspace */}
            <div className="bg-[#121215] border border-[#27272A] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222225]">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#EA5D3A]" />
                  <h3 className="text-base font-bold text-[#F4F4F5]">
                    {activeSquad ? activeSquad.name : 'Squad Cohorts & Lounge'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 bg-[#EA5D3A] hover:bg-[#F2633F] text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-md shadow-[#EA5D3A]/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Join / Create Squad</span>
                </button>
              </div>

              {/* Active Squad Workspace Channels & Messages */}
              {activeSquad ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Channel List Sidebar */}
                  <div className="lg:col-span-3 bg-[#09090B] border border-[#222225] rounded-lg p-3 space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2 px-2">Text Channels</h4>
                    {TEXT_CHANNELS.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChannel(ch.id)}
                        className={`w-full px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
                          activeChannel === ch.id
                            ? 'bg-[#18181B] text-white border border-[#EA5D3A]/40'
                            : 'text-[#9CA3AF] hover:text-white hover:bg-[#121215]'
                        }`}
                      >
                        {ch.icon}
                        <span>{ch.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Channel Content Canvas */}
                  <div className="lg:col-span-9 bg-[#09090B] border border-[#222225] rounded-lg p-4 min-h-[500px]">
                    {activeChannel === 'general' && <SquadChat />}
                    {activeChannel === 'code-sharing' && <PeerCodeReviewQueue />}
                    {activeChannel === 'leaderboard' && <SquadLeaderboard />}
                    {activeChannel === 'weekly-challenge' && <SquadWeeklyChallenge />}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-[#09090B] border border-[#222225] rounded-lg p-6 space-y-4">
                  <Compass className="w-10 h-10 text-[#EA5D3A] mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-[#F4F4F5]">No Active Squad Selected</h4>
                    <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
                      Join a study cohort to unlock live squad chat, code reviews, and leaderboard battles!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 bg-[#EA5D3A] hover:bg-[#F2633F] text-white font-bold text-xs rounded-xl shadow-lg transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Explore & Join Pods</span>
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
