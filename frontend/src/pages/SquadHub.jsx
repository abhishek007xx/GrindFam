import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SquadChat from '../components/squad/SquadChat';
import SquadCodeSharing from '../components/squad/SquadCodeSharing';
import SquadLeaderboard from '../components/squad/SquadLeaderboard';
import SquadWeeklyChallenge from '../components/squad/SquadWeeklyChallenge';
import SquadSettings from '../components/squad/SquadSettings';
import {
  MessageCircle, Code, Trophy, Target, Settings, Users, PlusCircle,
  LogIn, Loader2, Copy, Check, Shield, Sparkles, Hash
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageCircle, color: 'text-indigo-400' },
  { id: 'dashboard', label: 'Dashboard', icon: Users, color: 'text-emerald-400' },
  { id: 'code', label: 'Code Sharing', icon: Code, color: 'text-teal-400' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-amber-400' },
  { id: 'challenge', label: 'Weekly Challenge', icon: Target, color: 'text-purple-400' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-[#8b949e]' },
];

export default function SquadHub() {
  const { session, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [squadInfo, setSquadInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState(null);
  const [inSquad, setInSquad] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Join/Create state
  const [showJoinCreate, setShowJoinCreate] = useState('join');
  const [squadNameInput, setSquadNameInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [squadCodeInput, setSquadCodeInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const token = session?.access_token;

  const fetchSquadInfo = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/squads/current`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setInSquad(data.inSquad || false);
      setSquadInfo(data.squad || null);
      setMembers(data.members || []);
      setRole(data.role || null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchSquadInfo(); }, [fetchSquadInfo]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!squadNameInput.trim()) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/squads/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: squadNameInput.trim(), goal: goalInput.trim() || null })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: data.message });
        setSquadNameInput(''); setGoalInput('');
        fetchSquadInfo();
      } else {
        setActionMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create squad.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!squadCodeInput.trim()) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/squads/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ squadCode: squadCodeInput.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: data.message });
        setSquadCodeInput('');
        fetchSquadInfo();
      } else {
        setActionMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to join squad.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave your squad?')) return;
    try {
      await fetch(`${API_BASE}/api/squads/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSquadInfo();
    } catch (err) { console.error(err); }
  };

  const handleCopyCode = () => {
    const code = squadInfo?.code || squadInfo?.id;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {/* No Squad — Join/Create */}
          {!inSquad ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-12">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-600/20">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent mb-2">
                  Join a Squad
                </h1>
                <p className="text-xs text-[#8b949e]">Team up with 5-10 friends, share code, solve challenges together.</p>
              </div>

              {/* Tab Switch */}
              <div className="flex bg-[#161b22] border border-[#30363d] rounded-2xl p-1 mb-6">
                <button onClick={() => setShowJoinCreate('join')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${showJoinCreate === 'join' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[#8b949e]'}`}>
                  <LogIn className="w-4 h-4" /> Join Squad
                </button>
                <button onClick={() => setShowJoinCreate('create')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${showJoinCreate === 'create' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[#8b949e]'}`}>
                  <PlusCircle className="w-4 h-4" /> Create Squad
                </button>
              </div>

              {actionMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold mb-4 ${actionMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {actionMessage.text}
                </div>
              )}

              {showJoinCreate === 'join' ? (
                <form onSubmit={handleJoin} className="space-y-4">
                  <input type="text" value={squadCodeInput} onChange={(e) => setSquadCodeInput(e.target.value)} placeholder="Enter Squad Code (e.g. SQUAD-9K21)" className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-white placeholder-[#6e7681] text-center font-mono tracking-widest focus:outline-none focus:border-indigo-500/50" />
                  <button type="submit" disabled={actionLoading} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm disabled:opacity-40 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    Join Squad
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreate} className="space-y-4">
                  <input type="text" value={squadNameInput} onChange={(e) => setSquadNameInput(e.target.value)} placeholder="Squad Name" className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-white placeholder-[#6e7681] focus:outline-none focus:border-indigo-500/50" required />
                  <input type="text" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="Squad Goal (e.g. Amazon SDE-1 Prep - Oct 2025)" className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-white placeholder-[#6e7681] focus:outline-none focus:border-indigo-500/50" />
                  <button type="submit" disabled={actionLoading} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm disabled:opacity-40 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    Create Squad
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Squad Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-2xl shadow-indigo-600/20">
                    {getInitials(squadInfo?.name)}
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-white">{squadInfo?.name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                      {squadInfo?.goal && (
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Target className="w-3 h-3" /> {squadInfo.goal}
                        </span>
                      )}
                      <span className="text-[10px] text-[#8b949e] flex items-center gap-1">
                        <Users className="w-3 h-3" /> {members.length}/{squadInfo?.max_members || 10}
                      </span>
                      <button onClick={handleCopyCode} className="flex items-center gap-1 text-[10px] text-[#8b949e] hover:text-indigo-400 transition-colors">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono">{squadInfo?.code}</span>
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Member Avatars */}
                <div className="flex items-center gap-1">
                  {members.slice(0, 6).map((m, i) => (
                    <div key={m.id || i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-[#0a0e17] flex items-center justify-center text-white text-[9px] font-bold -ml-2 first:ml-0" title={m.name}>
                      {getInitials(m.name)}
                    </div>
                  ))}
                  {members.length > 6 && (
                    <span className="text-[10px] text-[#8b949e] ml-1">+{members.length - 6}</span>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto gap-1 bg-[#161b22] border border-[#30363d] rounded-2xl p-1.5 mb-6 scrollbar-hide">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : `text-[#8b949e] hover:bg-[#21262d] hover:text-white`
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'chat' && <SquadChat squadId={squadInfo?.id} />}

                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Shared Progress Dashboard
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {members.map((m) => {
                          const isMe = m.id === profile?.id;
                          return (
                            <div key={m.id} className={`p-4 bg-[#161b22] border rounded-2xl ${isMe ? 'border-indigo-500/40 ring-1 ring-indigo-500/20' : 'border-[#30363d]'} hover:border-indigo-500/20 transition-colors`}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                  {getInitials(m.name)}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-white">{m.name}{isMe ? ' (You)' : ''}</span>
                                  {m.role === 'leader' && (
                                    <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">LEADER</span>
                                  )}
                                  <p className="text-[10px] text-[#6e7681]">@{m.username || '—'}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-[#6e7681]">Problems this week</span>
                                  <span className="text-sm font-black text-emerald-400">{m.weekly_solved || 0}</span>
                                </div>
                                <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${Math.min(100, (m.weekly_solved || 0) * 10)}%` }} />
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
                  {activeTab === 'settings' && (
                    <SquadSettings
                      squadInfo={squadInfo}
                      members={members}
                      role={role}
                      onRefresh={fetchSquadInfo}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
