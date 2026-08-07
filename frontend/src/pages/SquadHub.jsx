import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSquadStore } from '../store/useSquadStore';
import SquadChat from '../components/squad/SquadChat';
import SquadCodeSharing from '../components/squad/SquadCodeSharing';
import SquadLeaderboard from '../components/squad/SquadLeaderboard';
import SquadWeeklyChallenge from '../components/squad/SquadWeeklyChallenge';
import SquadSettings from '../components/squad/SquadSettings';
import SquadManagerModal from '../components/SquadManagerModal';
import SquadIcon from '../components/squad/SquadIcon';
import ChannelButton from '../components/squad/ChannelButton';
import MemberCard from '../components/squad/MemberCard';
import MemberPopover from '../components/squad/MemberPopover';
import DMList from '../components/squad/DMList';
import DMChat from '../components/squad/DMChat';
import NewDMModal from '../components/squad/NewDMModal';
import {
  Hash, Volume2, ChevronDown, Plus, Settings, Users, Compass,
  Loader2, ExternalLink, Menu, X, Flame
} from 'lucide-react';
import { supabase } from '../supabase';

const TEXT_CHANNELS = [
  { id: 'general', label: 'general', icon: <Hash className="w-5 h-5" /> },
  { id: 'code-sharing', label: 'code-sharing', icon: <Hash className="w-5 h-5" /> },
  { id: 'leaderboard', label: 'leaderboard', icon: <Hash className="w-5 h-5" /> },
  { id: 'weekly-challenge', label: 'weekly-challenge', icon: <Hash className="w-5 h-5" /> },
];

const VOICE_CHANNELS = [
  { id: 'vc-mock', label: 'mock-interviews', icon: <Volume2 className="w-5 h-5" /> },
  { id: 'vc-study', label: 'study-room', icon: <Volume2 className="w-5 h-5" /> },
];

const CHANNEL_TOPICS = {
  'general': 'Coding Community chat — talk about DSA, interviews, and life',
  'code-sharing': 'Share your LeetCode solutions for peer review',
  'leaderboard': 'See who\'s grinding the hardest this week',
  'weekly-challenge': 'Vote on 5 problems to tackle together this week',
  'settings': 'Community settings and Discord server management'
};

export default function SquadHub() {
  const { session, profile } = useAuth();
  const {
    mySquads, communitySquads, activeSquad, activeChannel, activeDM, members, loading,
    loadMySquads, fetchCommunitySquads, loadDMThreads, setActiveSquad, setActiveChannel,
    joinByCode, showMemberList, toggleMemberList
  } = useSquadStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewDMModalOpen, setIsNewDMModalOpen] = useState(false);
  const [channelSidebarOpen, setChannelSidebarOpen] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [userStreak, setUserStreak] = useState(0);

  useEffect(() => {
    loadMySquads();
    fetchCommunitySquads();
    loadDMThreads();
  }, [loadMySquads, fetchCommunitySquads, loadDMThreads]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchStreak = async () => {
      try {
        const { data } = await supabase
          .from('user_progress')
          .select('solved_at')
          .eq('user_id', session.user.id)
          .eq('status', 'solved');
        const dates = [...new Set((data || []).map(p => p.solved_at ? p.solved_at.split('T')[0] : null).filter(Boolean))].sort();
        let streak = 0;
        if (dates.length > 0) {
          streak = 1;
          for (let i = dates.length - 1; i > 0; i--) {
            const curr = new Date(dates[i]);
            const prev = new Date(dates[i - 1]);
            const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) streak++;
            else break;
          }
        }
        setUserStreak(streak);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStreak();
  }, [session]);

  const isAdmin = activeSquad?.role === 'admin';

  const handleVoiceClick = (vc) => {
    if (activeSquad?.discord_invite_url) {
      window.open(activeSquad.discord_invite_url, '_blank');
    } else if (isAdmin) {
      setActiveChannel('settings');
    } else {
      alert('Ask your community admin to connect Discord to enable voice channels.');
    }
  };

  const handleJoinCommunity = async (squad) => {
    setJoiningId(squad.id);
    try {
      await joinByCode(squad.invite_code || squad.code || squad.id);
    } catch (err) {
      alert(err.message || 'Failed to join.');
    } finally {
      setJoiningId(null);
    }
  };

  if (loading && mySquads.length === 0) {
    return (
      <div className="h-full flex-1 bg-[#0d1117] flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
      </div>
    );
  }

  const noSquads = mySquads.length === 0 && !activeSquad;

  return (
    <div className="h-full flex-1 flex overflow-hidden bg-[#0d1117] text-[#dce5d9]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* COLUMN 1: Community Rail (72px) */}
      <div className="w-[72px] max-md:w-14 bg-[#091009] flex flex-col items-center py-3 gap-1 flex-shrink-0 border-r border-[#21262d] overflow-y-auto scrollbar-hide">
        {/* Home / Discover Button */}
        <div className="relative group flex items-center justify-center mb-2">
          <button
            onClick={() => { setActiveSquad(null); }}
            className={`w-12 max-md:w-10 h-12 max-md:h-10 flex items-center justify-center transition-all duration-300 ${
              !activeSquad && !activeDM
                ? 'rounded-2xl bg-[#22c55e] text-[#0e150e]'
                : 'rounded-[24px] bg-[#161b22] text-[#dce5d9] hover:rounded-2xl hover:bg-[#22c55e] hover:text-[#0e150e]'
            }`}
          >
            <Compass className="w-6 h-6 max-md:w-5 max-md:h-5" />
          </button>
          <div className="absolute left-16 max-md:left-14 bg-[#091009] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Discover Coding Communities
          </div>
        </div>

        <div className="w-8 h-0.5 bg-[#21262d] rounded-full mb-2" />

        {mySquads.map((sq) => (
          <SquadIcon
            key={sq.id}
            squad={sq}
            isActive={!activeDM && activeSquad?.id === sq.id}
            onClick={() => { setActiveSquad(sq.id); setChannelSidebarOpen(false); }}
          />
        ))}

        <div className="w-8 h-0.5 bg-[#21262d] rounded-full my-1" />

        {/* Add Community Button */}
        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-12 max-md:w-10 h-12 max-md:h-10 rounded-[24px] bg-[#161b22] text-[#22c55e] hover:rounded-2xl hover:bg-[#22c55e] hover:text-[#0e150e] flex items-center justify-center transition-all duration-300"
          >
            <Plus className="w-6 h-6 max-md:w-5 max-md:h-5" />
          </button>
          <div className="absolute left-16 max-md:left-14 bg-[#091009] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Create or Join Community
          </div>
        </div>
      </div>

      {/* COLUMN 2: Contextual Sidebar (240px) */}
      {(activeSquad || activeDM) ? (
        <>
          <div className={`w-60 bg-[#161b22] flex flex-col flex-shrink-0 border-r border-[#21262d] transition-transform duration-200 max-md:fixed max-md:left-14 max-md:top-14 max-md:bottom-0 max-md:z-40 ${
            channelSidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
          }`}>
            {/* Header */}
            <button className="h-12 px-4 flex items-center justify-between border-b border-[#21262d] shadow-sm hover:bg-[#1a221a] transition-colors flex-shrink-0">
              <span className="text-[15px] font-bold text-white truncate">
                {activeDM ? 'Direct Messages' : activeSquad?.name || 'Coding Community'}
              </span>
              <ChevronDown className="w-4 h-4 text-[#869585] flex-shrink-0" />
            </button>

            {/* Channels & DM Section List */}
            <div className="flex-1 overflow-y-auto px-2 pt-4 space-y-4 scrollbar-thin scrollbar-thumb-[#21262d]">
              {/* Direct Messages Section */}
              <DMList onOpenNewDM={() => setIsNewDMModalOpen(true)} />

              {/* Text Channels */}
              {activeSquad && (
                <div>
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#869585]">
                      TEXT CHANNELS
                    </span>
                  </div>
                  {TEXT_CHANNELS.map((ch) => (
                    <ChannelButton
                      key={ch.id}
                      icon={ch.icon}
                      label={ch.label}
                      isActive={!activeDM && activeChannel === ch.id}
                      onClick={() => { setActiveChannel(ch.id); setChannelSidebarOpen(false); }}
                    />
                  ))}
                </div>
              )}

              {/* Voice Channels */}
              {activeSquad && (
                <div>
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#869585]">
                      VOICE CHANNELS
                    </span>
                  </div>
                  {VOICE_CHANNELS.map((vc) => (
                    <ChannelButton
                      key={vc.id}
                      icon={vc.icon}
                      label={vc.label}
                      isActive={false}
                      onClick={() => handleVoiceClick(vc)}
                      isMuted={!activeSquad?.discord_invite_url}
                    />
                  ))}
                  {!activeSquad?.discord_invite_url && isAdmin && (
                    <button
                      onClick={() => setActiveChannel('settings')}
                      className="w-full text-left text-[11px] text-[#22d3ee] px-2 mt-1 hover:underline flex items-center gap-1 font-semibold"
                    >
                      + Connect Discord Server
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom User Panel */}
            <div className="h-14 bg-[#091009] border-t border-[#21262d] px-3 flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <div className="w-8 h-8 rounded-2xl bg-[#22c55e] flex items-center justify-center text-[#0e150e] text-xs font-bold">
                  {(profile?.username || profile?.leetcode_username || 'U')[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#091009] bg-[#22c55e]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate leading-tight">
                  {profile?.username || profile?.leetcode_username || 'User'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-[#ff8b7c] font-semibold">
                  <Flame className="w-3 h-3" />
                  <span>{userStreak}d streak</span>
                </div>
              </div>

              {activeSquad && (
                <button
                  onClick={() => setActiveChannel('settings')}
                  className="p-1.5 text-[#869585] hover:text-white rounded-lg hover:bg-[#1a221a] transition-colors"
                  title="Community Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* COLUMN 3: Main Content (Fluid) */}
      <div className="flex-1 flex flex-col bg-[#111315] min-w-0">
        {activeDM ? (
          /* ACTIVE DM THREAD VIEW */
          <DMChat />
        ) : !activeSquad ? (
          /* DISCOVER / FIRST-RUN EMPTY STATE */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="h-12 flex items-center mb-6">
              <Compass className="w-5 h-5 text-[#22d3ee] mr-2" />
              <h2 className="text-xl font-bold text-white">Discover Coding Communities</h2>
            </div>

            {noSquads && (
              <div className="text-center py-16 bg-[#161b22] border border-[#21262d] rounded-2xl mb-8">
                <div className="w-20 h-20 rounded-3xl bg-[#22c55e] flex items-center justify-center mx-auto mb-4 text-[#0e150e]">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">You're not in any community squads yet</h3>
                <p className="text-xs text-[#869585] mb-6 max-w-sm mx-auto">
                  Join a public community prep group or create your community squad to grind LeetCode with your friends.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-[#22c55e] hover:bg-[#1ea34d] text-[#0e150e] rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#22c55e]/20"
                >
                  Create your community squad
                </button>
              </div>
            )}

            {communitySquads.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communitySquads.map((sq) => {
                  const isMember = mySquads.some(m => m.id === sq.id);
                  return (
                    <div key={sq.id} className="p-5 bg-[#161b22] border border-[#21262d] rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#22c55e]/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#22c55e]">
                            Community
                          </span>
                          <span className="text-xs text-[#869585]">{sq.member_count}/100 Members</span>
                        </div>
                        <h4 className="text-base font-bold text-white">{sq.name}</h4>
                        <p className="text-xs text-[#869585] mt-1 line-clamp-2">{sq.description || sq.goal || 'Public prep community'}</p>
                      </div>

                      <button
                        onClick={() => handleJoinCommunity(sq)}
                        disabled={isMember || joiningId === sq.id}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isMember
                            ? 'bg-[#091009] text-[#869585] border border-[#21262d]'
                            : 'bg-[#22c55e] hover:bg-[#1ea34d] text-[#0e150e] shadow-md'
                        }`}
                      >
                        {joiningId === sq.id ? <Loader2 className="w-4 h-4 animate-spin" /> : isMember ? 'Already Joined' : 'Join Community'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE COMMUNITY SQUAD MAIN VIEW */
          <>
            {/* Channel Header Bar */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-[#21262d] bg-[#161b22] shadow-sm flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => setChannelSidebarOpen(!channelSidebarOpen)}
                  className="md:hidden p-1.5 text-[#869585] hover:text-white rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <Hash className="w-5 h-5 text-[#869585] flex-shrink-0" />
                <span className="text-[15px] font-bold text-white">{activeChannel}</span>
                {CHANNEL_TOPICS[activeChannel] && (
                  <>
                    <div className="w-px h-5 bg-[#21262d] mx-2 max-md:hidden" />
                    <span className="text-xs text-[#869585] truncate max-md:hidden">
                      {CHANNEL_TOPICS[activeChannel]}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeSquad?.discord_invite_url && (
                  <a
                    href={activeSquad.discord_invite_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-[#22d3ee] hover:text-white rounded-lg hover:bg-[#1a221a] transition-colors"
                    title="Open Community Discord"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={toggleMemberList}
                  className={`p-1.5 rounded-lg transition-colors max-md:hidden ${showMemberList ? 'text-white bg-[#1a221a]' : 'text-[#869585] hover:text-white'}`}
                  title="Toggle Member List"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Section */}
            <div className="flex-1 flex min-h-0">
              <div className="flex-1 flex flex-col min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeChannel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    {activeChannel === 'general' && <SquadChat />}
                    {activeChannel === 'code-sharing' && (
                      <div className="flex-1 overflow-y-auto p-6">
                        <SquadCodeSharing />
                      </div>
                    )}
                    {activeChannel === 'leaderboard' && (
                      <div className="flex-1 overflow-y-auto p-6">
                        <SquadLeaderboard />
                      </div>
                    )}
                    {activeChannel === 'weekly-challenge' && (
                      <div className="flex-1 overflow-y-auto p-6">
                        <SquadWeeklyChallenge />
                      </div>
                    )}
                    {activeChannel === 'settings' && (
                      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
                        <SquadSettings />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* COLUMN 4: Member List Sidebar (240px) */}
              {showMemberList && (
                <div className="w-60 bg-[#161b22] flex-shrink-0 border-l border-[#21262d] overflow-y-auto p-4 max-md:hidden scrollbar-thin scrollbar-thumb-[#21262d]">
                  <h4 className="text-[11px] font-bold uppercase text-[#869585] tracking-wider mb-2 px-1">
                    COMMUNITY MEMBERS — {members.length}
                  </h4>
                  <div className="space-y-0.5">
                    {members.map((m) => (
                      <MemberCard
                        key={m.user_id}
                        member={m}
                        isCurrentUser={m.user_id === session?.user?.id}
                        onClick={() => setSelectedMember(m)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Member Profile Popover Modal */}
      {selectedMember && (
        <MemberPopover member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

      {/* New DM Modal */}
      <NewDMModal isOpen={isNewDMModalOpen} onClose={() => setIsNewDMModalOpen(false)} />

      {/* Squad Manager Modal */}
      <SquadManagerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
