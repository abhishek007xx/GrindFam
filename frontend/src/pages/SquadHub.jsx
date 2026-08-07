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
import DMList from '../components/squad/DMList';
import DMChat from '../components/squad/DMChat';
import NewDMModal from '../components/squad/NewDMModal';
import {
  MessageSquare, LayoutDashboard, Code, Trophy, Target, Settings,
  Users, Compass, Plus, LogIn, Lock, Globe, Loader2, Link2, Copy, Check, Hash
} from 'lucide-react';

const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'dms', label: 'Direct Messages', icon: MessageSquare },
  { id: 'code-sharing', label: 'Code Sharing', icon: Code },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'weekly-challenge', label: 'Weekly Challenge', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function SquadHub() {
  const { session } = useAuth();
  const {
    mySquads, communitySquads, activeSquad, activeChannel, activeDMThread,
    loading, loadMySquads, fetchCommunitySquads, loadDMThreads, setActiveSquad,
    setActiveChannel, createSquad, joinByCode, leaveSquad
  } = useSquadStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewDMOpen, setIsNewDMOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [squadType, setSquadType] = useState('private');
  const [squadNameInput, setSquadNameInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [squadCodeInput, setSquadCodeInput] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadMySquads();
    fetchCommunitySquads();
    loadDMThreads();
  }, [loadMySquads, fetchCommunitySquads, loadDMThreads]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!squadNameInput.trim()) return;
    setFormLoading(true);
    setMessage(null);
    try {
      await createSquad({ name: squadNameInput.trim(), squad_type: squadType, description: descriptionInput.trim() || null });
      setMessage({ type: 'success', text: 'Community squad created!' });
      setSquadNameInput('');
      setDescriptionInput('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create community squad.' });
    } finally { setFormLoading(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!squadCodeInput.trim()) return;
    setFormLoading(true);
    setMessage(null);
    try {
      await joinByCode(squadCodeInput.trim());
      setMessage({ type: 'success', text: 'Joined community squad!' });
      setSquadCodeInput('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to join community squad.' });
    } finally { setFormLoading(false); }
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
      <div className="h-full flex-1 bg-[#0a0e17] flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
      </div>
    );
  }

  const currentTab = activeDMThread ? 'dms' : activeTab;

  return (
    <div className="h-full flex-1 flex flex-col bg-[#0a0e17] text-[#e6edf3] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              {activeSquad ? activeSquad.name : 'Coding Community'}
            </h1>
            <p className="text-xs text-[#8b949e]">
              {activeSquad ? (activeSquad.description || activeSquad.goal || 'Community Prep Hub') : 'Connect, chat, and grind DSA problems together'}
            </p>
          </div>
        </div>

        {mySquads.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Squad Switcher Dropdown */}
            <select
              value={activeSquad?.id || ''}
              onChange={(e) => setActiveSquad(e.target.value)}
              className="px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white focus:outline-none focus:border-[#22c55e]"
            >
              {mySquads.map((sq) => (
                <option key={sq.id} value={sq.id}>
                  {sq.name} ({sq.squad_type || 'private'})
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-[#22c55e] hover:bg-[#1ea34d] text-[#0e150e] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Squad
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      {!activeSquad && mySquads.length === 0 ? (
        /* NO SQUAD / DISCOVERY & CREATE VIEW */
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-xl mx-auto p-6 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center mx-auto mb-3 text-[#22c55e]">
                <Users className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Join or Create a Community Squad</h2>
              <p className="text-xs text-[#8b949e] mt-1">Start grinding LeetCode with your peers</p>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ff8b7c]/20 text-[#ff8b7c]'}`}>
                {message.text}
              </div>
            )}

            {/* Create or Join Tabs */}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#8b949e] mb-2 block">Squad Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSquadType('private')}
                    className={`p-3 rounded-xl border text-left transition-all ${squadType === 'private' ? 'bg-[#22c55e]/15 border-[#22c55e] ring-1 ring-[#22c55e]/30' : 'bg-[#0d1117] border-[#30363d]'}`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                      <Lock className="w-3.5 h-3.5 text-[#22c55e]" /> Private Squad
                    </div>
                    <p className="text-[10px] text-[#8b949e]">For close friends (max 10)</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSquadType('community')}
                    className={`p-3 rounded-xl border text-left transition-all ${squadType === 'community' ? 'bg-[#22d3ee]/15 border-[#22d3ee] ring-1 ring-[#22d3ee]/30' : 'bg-[#0d1117] border-[#30363d]'}`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                      <Globe className="w-3.5 h-3.5 text-[#22d3ee]" /> Community Squad
                    </div>
                    <p className="text-[10px] text-[#8b949e]">Public group (max 100)</p>
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={squadNameInput}
                onChange={(e) => setSquadNameInput(e.target.value)}
                placeholder="Community Squad Name"
                required
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-[#22c55e]"
              />
              <input
                type="text"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Description / Goal (e.g. Amazon SDE Prep)"
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-[#22c55e]"
              />

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-[#22c55e] hover:bg-[#1ea34d] text-[#0e150e] rounded-xl text-xs font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Community Squad
              </button>
            </form>

            <div className="pt-4 border-t border-[#30363d]">
              <form onSubmit={handleJoin} className="flex gap-2">
                <input
                  type="text"
                  value={squadCodeInput}
                  onChange={(e) => setSquadCodeInput(e.target.value)}
                  placeholder="Or enter Invite Code..."
                  className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white font-mono uppercase tracking-wider placeholder-[#8b949e] focus:outline-none focus:border-[#22c55e]"
                />
                <button
                  type="submit"
                  disabled={formLoading || !squadCodeInput.trim()}
                  className="px-5 py-2.5 bg-[#22d3ee] hover:bg-[#00cbe6] text-[#0e150e] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" /> Join
                </button>
              </form>
            </div>
          </div>

          {/* Public Community Squads List */}
          {communitySquads.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#22d3ee]" /> Public Community Squads
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communitySquads.map((sq) => (
                  <div key={sq.id} className="p-4 bg-[#161b22] border border-[#30363d] rounded-2xl flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#22c55e]">
                        Community
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{sq.name}</h4>
                      <p className="text-xs text-[#8b949e] mt-0.5 line-clamp-2">{sq.description || sq.goal || 'Public prep squad'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#30363d]">
                      <span className="text-[11px] text-[#8b949e]">{sq.member_count} Members</span>
                      <button
                        onClick={() => handleJoinCommunity(sq)}
                        disabled={joiningId === sq.id}
                        className="px-3 py-1.5 bg-[#22c55e] hover:bg-[#1ea34d] text-[#0e150e] rounded-lg text-xs font-bold transition-all"
                      >
                        {joiningId === sq.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Join'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ACTIVE SQUAD MAIN VIEW WITH TABS */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Navigation Tabs */}
          <div className="px-6 bg-[#161b22] border-b border-[#30363d] flex items-center gap-1 overflow-x-auto scrollbar-hide flex-shrink-0">
            {TABS.map((t) => {
              const isActive = currentTab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.id === 'dms') {
                      useSquadStore.setState({ activeChannel: 'dms' });
                    } else {
                      useSquadStore.setState({ activeChannel: t.id, activeDMThread: null });
                    }
                    setActiveTab(t.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-[#22c55e] text-[#22c55e]'
                      : 'border-transparent text-[#8b949e] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* View Container */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                {currentTab === 'chat' && <SquadChat />}
                {currentTab === 'dms' && (
                  activeDMThread ? (
                    <DMChat />
                  ) : (
                    <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto w-full">
                      <DMList onOpenNewDM={() => setIsNewDMOpen(true)} />
                    </div>
                  )
                )}
                {currentTab === 'code-sharing' && (
                  <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                    <SquadCodeSharing />
                  </div>
                )}
                {currentTab === 'leaderboard' && (
                  <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                    <SquadLeaderboard />
                  </div>
                )}
                {currentTab === 'weekly-challenge' && (
                  <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                    <SquadWeeklyChallenge />
                  </div>
                )}
                {currentTab === 'settings' && (
                  <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
                    <SquadSettings />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modals */}
      <SquadManagerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <NewDMModal isOpen={isNewDMOpen} onClose={() => setIsNewDMOpen(false)} />
    </div>
  );
}
