import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSquadStore } from '../store/useSquadStore';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SquadChat from '../components/squad/SquadChat';
import SquadCodeSharing from '../components/squad/SquadCodeSharing';
import SquadLeaderboard from '../components/squad/SquadLeaderboard';
import SquadWeeklyChallenge from '../components/squad/SquadWeeklyChallenge';
import SquadSettings from '../components/squad/SquadSettings';
import SquadManagerModal from '../components/SquadManagerModal';
import {
  MessageCircle, Code, Trophy, Target, Settings, Users, PlusCircle,
  LogIn, Loader2, Copy, Check, Hash, Sparkles, Compass, ChevronDown, ExternalLink, MessageSquare
} from 'lucide-react';

const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageCircle, color: 'text-emerald-400' },
  { id: 'dashboard', label: 'Dashboard', icon: Users, color: 'text-teal-400' },
  { id: 'code', label: 'Code Sharing', icon: Code, color: 'text-cyan-400' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-amber-400' },
  { id: 'challenge', label: 'Weekly Challenge', icon: Target, color: 'text-purple-400' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-[#8b949e]' },
];

export default function SquadHub() {
  const { session } = useAuth();
  const {
    mySquads,
    communitySquads,
    activeSquad,
    members,
    loading,
    loadMySquads,
    fetchCommunitySquads,
    setActiveSquad,
    joinByCode,
    createSquad,
    leaveSquad
  } = useSquadStore();

  const [activeTab, setActiveTab] = useState('chat');
  const [hubMode, setHubMode] = useState('my-squads'); // 'my-squads' | 'discover'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    loadMySquads();
    fetchCommunitySquads();
  }, [loadMySquads, fetchCommunitySquads]);

  const handleCopyInvite = () => {
    const code = activeSquad?.invite_code || activeSquad?.code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleJoinCommunity = async (squad) => {
    const code = squad.invite_code || squad.code || squad.id;
    setJoiningId(squad.id);
    try {
      await joinByCode(code);
      setHubMode('my-squads');
    } catch (err) {
      alert(err.message || 'Failed to join squad.');
    } finally {
      setJoiningId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SQ';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  if (loading && mySquads.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
      </div>
    );
  }

  const isAdmin = activeSquad?.role === 'admin' || activeSquad?.role === 'leader';
  const communityInvite = import.meta.env.VITE_DISCORD_COMMUNITY_INVITE || 'https://discord.gg/grindfam';

  return (
    <div className="min-h-screen bg-[#0d1117] flex text-[#e6edf3]">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Top Bar: Squad Switcher & Discover Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#161b22] border border-[#30363d] rounded-2xl">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
              <span className="text-xs font-bold text-[#8b949e] uppercase tracking-wider whitespace-nowrap">Your Squads:</span>
              {mySquads.length === 0 ? (
                <span className="text-xs text-[#6e7681] italic">No squads joined</span>
              ) : (
                mySquads.map((sq) => {
                  const isActive = activeSquad?.id === sq.id;
                  const isCommunity = sq.squad_type === 'community';
                  return (
                    <button
                      key={sq.id}
                      onClick={() => {
                        setHubMode('my-squads');
                        setActiveSquad(sq.id);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        isActive && hubMode === 'my-squads'
                          ? 'bg-[#22c55e]/15 border-[#22c55e]/40 text-[#22c55e]'
                          : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                      }`}
                    >
                      <span>{sq.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase font-black ${
                        isCommunity ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#30363d] text-[#8b949e]'
                      }`}>
                        {sq.squad_type || 'private'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setHubMode(hubMode === 'discover' ? 'my-squads' : 'discover')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  hubMode === 'discover'
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-purple-400" />
                <span>Discover Community Squads</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#1ea34d] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#22c55e]/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create / Join</span>
              </button>
            </div>
          </div>

          {/* DISCOVER COMMUNITY SQUADS MODE */}
          {hubMode === 'discover' ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-400" /> Discover Community Prep Groups
                </h2>
                <p className="text-xs text-[#8b949e] mt-1">
                  Public squads for college campus placement and company preparation (max 100 members).
                </p>
              </div>

              {communitySquads.length === 0 ? (
                <div className="text-center py-16 bg-[#161b22]/40 border border-[#30363d] rounded-2xl">
                  <Users className="w-12 h-12 text-[#30363d] mx-auto mb-3" />
                  <p className="text-sm font-bold text-white">No community squads found</p>
                  <p className="text-xs text-[#8b949e] mt-1">Be the first to create a public Community Squad!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communitySquads.map((sq) => {
                    const isMember = mySquads.some(m => m.id === sq.id);
                    return (
                      <div key={sq.id} className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-3 flex flex-col justify-between hover:border-[#22c55e]/40 transition-colors">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                              Community
                            </span>
                            <span className="text-xs text-[#8b949e]">
                              {sq.member_count}/100 members
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-white">{sq.name}</h3>
                          <p className="text-xs text-[#8b949e] line-clamp-2 mt-1">{sq.description || sq.goal || 'Public prep squad'}</p>
                        </div>

                        <button
                          onClick={() => handleJoinCommunity(sq)}
                          disabled={isMember || joiningId === sq.id}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                            isMember
                              ? 'bg-[#21262d] text-[#6e7681] cursor-default'
                              : 'bg-[#22c55e] hover:bg-[#1ea34d] text-white shadow-lg shadow-[#22c55e]/20'
                          }`}
                        >
                          {joiningId === sq.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isMember ? (
                            'Already Member'
                          ) : (
                            <>
                              <LogIn className="w-4 h-4" /> Join Community Squad
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : !activeSquad ? (
            /* NO SQUAD EMPTY STATE */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-12 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#22c55e] to-teal-600 flex items-center justify-center mx-auto shadow-2xl shadow-[#22c55e]/20 border border-[#22c55e]/30">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-white via-emerald-200 to-teal-400 bg-clip-text text-transparent mb-2">
                  No Squad Joined Yet
                </h1>
                <p className="text-xs text-[#8b949e]">
                  Join a private 10-person group with close friends or explore public 100-person community squads.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setHubMode('discover')} className="flex-1 py-3 bg-[#161b22] border border-[#30363d] hover:border-[#22c55e]/40 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2">
                  <Compass className="w-4 h-4 text-purple-400" /> Discover Squads
                </button>
                <button onClick={() => setIsCreateModalOpen(true)} className="flex-1 py-3 bg-[#22c55e] hover:bg-[#1ea34d] rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-[#22c55e]/20 flex items-center justify-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Create Squad
                </button>
              </div>
            </motion.div>
          ) : (
            /* ACTIVE SQUAD DASHBOARD & TABS */
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Squad Header Banner */}
              <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22c55e] to-teal-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[#22c55e]/20 border border-[#22c55e]/30">
                    {getInitials(activeSquad?.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-black text-white">{activeSquad?.name}</h1>
                      <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                        activeSquad?.squad_type === 'community'
                          ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                          : 'bg-[#30363d] text-[#8b949e]'
                      }`}>
                        {activeSquad?.squad_type || 'private'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      {activeSquad?.goal && (
                        <span className="text-[10px] text-[#22c55e] bg-[#22c55e]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#22c55e]/20 font-bold">
                          <Target className="w-3 h-3" /> {activeSquad.goal}
                        </span>
                      )}
                      <span className="text-[10px] text-[#8b949e] flex items-center gap-1">
                        <Users className="w-3 h-3 text-teal-400" /> {members.length}/{activeSquad?.max_members || 10} members
                      </span>
                      <button onClick={handleCopyInvite} className="flex items-center gap-1 text-[10px] text-[#8b949e] hover:text-[#22c55e] transition-colors bg-[#0d1117] px-2.5 py-1 rounded-md font-mono border border-[#30363d]">
                        <Hash className="w-3 h-3 text-[#22c55e]" />
                        <span>Code: {activeSquad?.invite_code || activeSquad?.code}</span>
                        {copiedCode ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Squad Discord Card Widget */}
                <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <span className="text-[10px] font-bold uppercase text-[#8b949e] block">Squad Discord</span>
                    {activeSquad?.discord_invite_url ? (
                      <a
                        href={activeSquad.discord_invite_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1 truncate"
                      >
                        Join Squad Channel <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <a
                        href={communityInvite}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#8b949e] hover:text-white flex items-center gap-1 truncate"
                      >
                        GrindFam Discord <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex overflow-x-auto gap-1.5 bg-[#161b22] border border-[#30363d] rounded-2xl p-1.5 scrollbar-hide">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/20'
                        : 'text-[#8b949e] hover:bg-[#21262d] hover:text-white'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Views */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'chat' && <SquadChat squadId={activeSquad.id} />}

                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#22c55e]" />
                        Squad Roster & Progress
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {members.map((m) => {
                          const isMe = m.user_id === session?.user?.id;
                          return (
                            <div key={m.user_id} className={`p-4 bg-[#161b22] border rounded-2xl ${isMe ? 'border-[#22c55e]/40 ring-1 ring-[#22c55e]/20' : 'border-[#30363d]'} hover:border-[#22c55e]/30 transition-colors`}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22c55e] to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                                  {getInitials(m.name)}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-white">{m.name}{isMe ? ' (You)' : ''}</span>
                                  {(m.role === 'admin' || m.role === 'leader') && (
                                    <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">ADMIN</span>
                                  )}
                                  <p className="text-[10px] text-[#6e7681]">@{m.username || 'grinder'}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'code' && <SquadCodeSharing />}
                  {activeTab === 'leaderboard' && <SquadLeaderboard />}
                  {activeTab === 'challenge' && <SquadWeeklyChallenge />}
                  {activeTab === 'settings' && <SquadSettings />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      <SquadManagerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        squadInfo={activeSquad}
        onCreateSquad={createSquad}
        onJoinSquad={joinByCode}
        onLeaveSquad={() => activeSquad && leaveSquad(activeSquad.id)}
      />
    </div>
  );
}
