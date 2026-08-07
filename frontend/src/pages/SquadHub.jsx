import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSquadStore } from '../store/useSquadStore';
import SquadChat from '../components/squad/SquadChat';
import SquadCodeSharing from '../components/squad/SquadCodeSharing';
import SquadLeaderboard from '../components/squad/SquadLeaderboard';
import SquadWeeklyChallenge from '../components/squad/SquadWeeklyChallenge';
import SquadManagerModal from '../components/SquadManagerModal';
import { SquadIcon, ChannelButton, MemberCard } from '../components/squad/DiscordComponents';
import {
  Hash, Volume2, ChevronDown, Plus, Settings, Users, Compass,
  Loader2, Mic, Headphones, ExternalLink, Menu, X
} from 'lucide-react';

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
  'general': 'Squad chat — talk about DSA, interviews, and life',
  'code-sharing': 'Share your LeetCode solutions for peer review',
  'leaderboard': 'See who\'s grinding the hardest this week',
  'weekly-challenge': 'Vote on 5 problems to tackle together this week',
};

export default function SquadHub() {
  const { session, profile } = useAuth();
  const {
    mySquads, communitySquads, activeSquad, activeChannel, members, loading,
    loadMySquads, fetchCommunitySquads, setActiveSquad, setActiveChannel,
    joinByCode, showMemberList, toggleMemberList
  } = useSquadStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    loadMySquads();
    fetchCommunitySquads();
  }, [loadMySquads, fetchCommunitySquads]);

  const isAdmin = activeSquad?.role === 'admin';
  const currentUser = session?.user;

  const handleVoiceClick = (vc) => {
    if (activeSquad?.discord_invite_url) {
      window.open(activeSquad.discord_invite_url, '_blank');
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
      <div className="h-screen bg-[#36393f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5865f2] animate-spin" />
      </div>
    );
  }

  const noSquads = mySquads.length === 0 && !activeSquad;

  return (
    <div className="h-screen flex overflow-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* COLUMN 1: Squad Server List */}
      <div className="w-[72px] max-md:w-14 bg-[#1e2124] flex flex-col items-center py-3 gap-0.5 flex-shrink-0 overflow-y-auto scrollbar-hide">
        {/* Home / Discover Button */}
        <div className="relative group flex items-center justify-center mb-2">
          <button
            onClick={() => { setActiveSquad(null); }}
            className={`w-12 max-md:w-10 h-12 max-md:h-10 flex items-center justify-center transition-all duration-300 ${
              !activeSquad
                ? 'rounded-2xl bg-[#5865f2] text-white'
                : 'rounded-[24px] bg-[#36393f] text-[#dcddde] hover:rounded-2xl hover:bg-[#5865f2] hover:text-white'
            }`}
          >
            <Compass className="w-6 h-6 max-md:w-5 max-md:h-5" />
          </button>
          <div className="absolute left-16 max-md:left-14 bg-[#18191c] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Discover Squads
          </div>
        </div>

        <div className="w-8 h-0.5 bg-[#36393f] rounded-full mb-2" />

        {mySquads.map((sq) => (
          <SquadIcon
            key={sq.id}
            squad={sq}
            isActive={activeSquad?.id === sq.id}
            onClick={() => { setActiveSquad(sq.id); setSidebarOpen(false); }}
          />
        ))}

        <div className="w-8 h-0.5 bg-[#36393f] rounded-full my-1" />

        {/* Add Squad Button */}
        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-12 max-md:w-10 h-12 max-md:h-10 rounded-[24px] bg-[#36393f] text-[#3ba55d] hover:rounded-2xl hover:bg-[#3ba55d] hover:text-white flex items-center justify-center transition-all duration-300"
          >
            <Plus className="w-6 h-6 max-md:w-5 max-md:h-5" />
          </button>
          <div className="absolute left-16 max-md:left-14 bg-[#18191c] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Add a Squad
          </div>
        </div>
      </div>

      {/* COLUMN 2: Channel Sidebar */}
      {activeSquad ? (
        <>
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden fixed top-3 left-16 z-50 p-1.5 bg-[#2f3136] rounded text-[#dcddde]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className={`w-60 bg-[#2f3136] flex flex-col flex-shrink-0 transition-transform duration-200 max-md:fixed max-md:left-14 max-md:top-0 max-md:bottom-0 max-md:z-40 ${
            sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
          }`}>
            {/* Server Header */}
            <button className="h-12 px-4 flex items-center justify-between border-b border-[#202225] shadow-sm hover:bg-[#34373c] transition-colors flex-shrink-0">
              <span className="text-[15px] font-semibold text-white truncate">{activeSquad.name}</span>
              <ChevronDown className="w-4 h-4 text-[#96989d] flex-shrink-0" />
            </button>

            {/* Channel List */}
            <div className="flex-1 overflow-y-auto px-2 pt-4 space-y-4 scrollbar-thin scrollbar-thumb-[#202225] scrollbar-track-transparent">
              {/* Text Channels */}
              <div>
                <div className="flex items-center justify-between px-1 mb-1 group cursor-pointer">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#96989d] group-hover:text-[#dcddde]">
                    Text Channels
                  </span>
                </div>
                {TEXT_CHANNELS.map((ch) => (
                  <ChannelButton
                    key={ch.id}
                    icon={ch.icon}
                    label={ch.label}
                    isActive={activeChannel === ch.id}
                    onClick={() => { setActiveChannel(ch.id); setSidebarOpen(false); }}
                  />
                ))}
              </div>

              {/* Voice Channels */}
              <div>
                <div className="flex items-center justify-between px-1 mb-1 group cursor-pointer">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#96989d] group-hover:text-[#dcddde]">
                    Voice Channels
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
                  <p className="text-[10px] text-[#72767d] px-2 mt-1 italic">
                    Connect Discord in Settings to enable voice
                  </p>
                )}
              </div>
            </div>

            {/* Bottom User Panel */}
            <div className="h-[52px] bg-[#292b2f] px-2 flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-xs font-bold">
                  {(profile?.username || profile?.leetcode_username || 'U')[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#292b2f] bg-[#3ba55d]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate leading-tight">
                  {profile?.username || profile?.leetcode_username || 'User'}
                </p>
                <p className="text-[11px] text-[#96989d] truncate leading-tight">Online</p>
              </div>
              <div className="flex items-center gap-0.5">
                <button className="p-1.5 text-[#b9bbbe] hover:text-[#dcddde] rounded hover:bg-[#36393f] transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-[#b9bbbe] hover:text-[#dcddde] rounded hover:bg-[#36393f] transition-colors">
                  <Headphones className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-[#b9bbbe] hover:text-[#dcddde] rounded hover:bg-[#36393f] transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* COLUMN 3: Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#36393f] min-w-0">
        {!activeSquad ? (
          /* DISCOVER / NO SQUAD VIEW */
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="h-12 px-4 flex items-center border-b border-[#202225] shadow-sm flex-shrink-0">
              <Compass className="w-5 h-5 text-[#96989d] mr-2" />
              <span className="text-[15px] font-semibold text-white">Discover Community Squads</span>
            </div>

            <div className="p-6 max-w-4xl mx-auto">
              {/* No squads empty state */}
              {noSquads && (
                <div className="text-center py-16 mb-8">
                  <div className="w-20 h-20 rounded-full bg-[#5865f2] flex items-center justify-center mx-auto mb-5">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">You're not in any squads yet</h2>
                  <p className="text-[#96989d] text-sm mb-6 max-w-sm mx-auto">
                    Join a community squad or create your own private group to grind LeetCode with friends.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm font-medium transition-colors"
                  >
                    Create or Join a Squad
                  </button>
                </div>
              )}

              {/* Community Squads Grid */}
              {communitySquads.length > 0 && (
                <>
                  <h3 className="text-xs font-bold uppercase text-[#96989d] tracking-wider mb-4">
                    Public Community Squads
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {communitySquads.map((sq) => {
                      const isMember = mySquads.some(m => m.id === sq.id);
                      return (
                        <div key={sq.id} className="bg-[#2f3136] rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
                          <div className="h-24 bg-gradient-to-br from-[#5865f2] to-[#3ba55d] relative">
                            <div className="absolute -bottom-6 left-4">
                              <div className="w-12 h-12 rounded-2xl bg-[#5865f2] border-4 border-[#2f3136] flex items-center justify-center text-white text-lg font-bold">
                                {(sq.name || 'S')[0].toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div className="pt-8 px-4 pb-4">
                            <h4 className="text-[15px] font-semibold text-white">{sq.name}</h4>
                            <p className="text-xs text-[#96989d] mt-1 line-clamp-2">
                              {sq.description || sq.goal || 'Public community prep squad'}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-[11px] text-[#72767d] flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-[#3ba55d]" />
                                {sq.member_count} Members
                              </span>
                              <button
                                onClick={() => handleJoinCommunity(sq)}
                                disabled={isMember || joiningId === sq.id}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                                  isMember
                                    ? 'bg-[#40444b] text-[#72767d] cursor-default'
                                    : 'bg-[#3ba55d] hover:bg-[#2d7d46] text-white'
                                }`}
                              >
                                {joiningId === sq.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : isMember ? 'Joined' : 'Join'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ACTIVE SQUAD CONTENT */
          <>
            {/* Channel Header */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-[#202225] shadow-sm flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Hash className="w-5 h-5 text-[#72767d] flex-shrink-0" />
                <span className="text-[15px] font-semibold text-white">{activeChannel}</span>
                {CHANNEL_TOPICS[activeChannel] && (
                  <>
                    <div className="w-px h-5 bg-[#42464d] mx-1 max-md:hidden" />
                    <span className="text-xs text-[#72767d] truncate max-md:hidden">
                      {CHANNEL_TOPICS[activeChannel]}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeSquad?.discord_invite_url && (
                  <a href={activeSquad.discord_invite_url} target="_blank" rel="noreferrer"
                    className="p-1.5 text-[#b9bbbe] hover:text-[#dcddde] rounded hover:bg-[#42464d] transition-colors"
                    title="Open Discord">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={toggleMemberList}
                  className={`p-1.5 rounded transition-colors ${showMemberList ? 'text-white bg-[#42464d]' : 'text-[#b9bbbe] hover:text-[#dcddde]'}`}
                  title="Toggle Member List">
                  <Users className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content + Members */}
            <div className="flex-1 flex min-h-0">
              {/* Main Content */}
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
                      <div className="flex-1 overflow-y-auto p-4">
                        <SquadCodeSharing />
                      </div>
                    )}
                    {activeChannel === 'leaderboard' && (
                      <div className="flex-1 overflow-y-auto p-4">
                        <SquadLeaderboard />
                      </div>
                    )}
                    {activeChannel === 'weekly-challenge' && (
                      <div className="flex-1 overflow-y-auto p-4">
                        <SquadWeeklyChallenge />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* COLUMN 4: Member List */}
              {showMemberList && (
                <div className="w-60 bg-[#2f3136] flex-shrink-0 overflow-y-auto p-4 max-md:hidden scrollbar-thin scrollbar-thumb-[#202225] scrollbar-track-transparent">
                  <h4 className="text-[11px] font-bold uppercase text-[#96989d] tracking-wider mb-2 px-1">
                    Online — {members.length}
                  </h4>
                  <div className="space-y-0.5">
                    {/* Admins first */}
                    {members.filter(m => m.role === 'admin').map((m) => (
                      <MemberCard key={m.user_id} member={m} isCurrentUser={m.user_id === currentUser?.id} />
                    ))}
                    {/* Then members */}
                    {members.filter(m => m.role !== 'admin').map((m) => (
                      <MemberCard key={m.user_id} member={m} isCurrentUser={m.user_id === currentUser?.id} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <SquadManagerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
