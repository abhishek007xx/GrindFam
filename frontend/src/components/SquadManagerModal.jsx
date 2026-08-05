import React, { useState } from 'react';
import { X, Users, PlusCircle, LogIn, LogOut, Copy, Check, Shield, Hash, Loader2, AlertCircle } from 'lucide-react';

const SquadManagerModal = ({ isOpen, onClose, squadInfo, onCreateSquad, onJoinSquad, onLeaveSquad }) => {
  const [activeTab, setActiveTab] = useState('join'); // 'join' | 'create'
  const [squadNameInput, setSquadNameInput] = useState('');
  const [squadCodeInput, setSquadCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!squadInfo?.code && !squadInfo?.id) return;
    const textToCopy = squadInfo.code || squadInfo.id;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!squadNameInput.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await onCreateSquad(squadNameInput.trim());
      setMessage({ type: 'success', text: res?.message || 'Squad created successfully!' });
      setSquadNameInput('');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create squad.' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!squadCodeInput.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await onJoinSquad(squadCodeInput.trim());
      setMessage({ type: 'success', text: res?.message || 'Joined squad successfully!' });
      setSquadCodeInput('');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to join squad.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave your current squad?')) return;
    setLoading(true);
    setMessage(null);
    try {
      await onLeaveSquad();
      setMessage({ type: 'success', text: 'You left the squad.' });
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to leave squad.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md dash-card p-6 border border-[#30363d] rounded-2xl shadow-2xl shadow-black/40 bg-[#0d1117] animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#21262d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#22c55e]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Squad Settings</h2>
              <p className="text-xs text-[#8b949e]">Create, join via Squad ID, or manage squad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Squad Banner */}
        {squadInfo && (
          <div className="my-4 p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#22c55e]" />
                <span className="text-xs font-semibold uppercase text-[#8b949e] tracking-wider">Active Squad</span>
              </div>
              <button
                type="button"
                onClick={handleLeave}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Leave Squad
              </button>
            </div>
            <h3 className="text-base font-extrabold text-white">{squadInfo.name}</h3>

            {/* Squad Code Box */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d1117] border border-[#21262d]">
                <div className="flex items-center gap-2 min-w-0">
                  <Hash className="w-4 h-4 text-[#6e7681] flex-shrink-0" />
                  <span className="text-xs text-[#8b949e]">Squad Code:</span>
                  <span className="font-mono text-sm font-bold text-[#22c55e] truncate">{squadInfo.code || squadInfo.id}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d1117] border border-[#21262d]">
                <span className="text-xs text-[#8b949e]">Invite Link:</span>
                <button
                  type="button"
                  onClick={() => {
                    const code = squadInfo.code || squadInfo.id;
                    const url = `${window.location.origin}/?joinSquad=${code}`;
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-[#22c55e] border border-[#22c55e]/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-[#161b22] p-1 rounded-xl border border-[#21262d] mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'join'
                ? 'bg-[#22c55e] text-white shadow-md'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Join Squad by ID
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-[#22c55e] text-white shadow-md'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Create New Squad
          </button>
        </div>

        {/* Tab Forms */}
        {activeTab === 'join' ? (
          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">
                Enter Squad ID / Code
              </label>
              <input
                type="text"
                value={squadCodeInput}
                onChange={(e) => setSquadCodeInput(e.target.value)}
                placeholder="e.g. SQUAD-9X82"
                required
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#22c55e] font-mono text-sm uppercase"
              />
              <p className="text-[11px] text-[#6e7681] mt-1">
                Ask your friend for their Squad ID to join their exact dashboard leaderboard.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !squadCodeInput.trim()}
              className="w-full py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Join Squad</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">
                Squad Name
              </label>
              <input
                type="text"
                value={squadNameInput}
                onChange={(e) => setSquadNameInput(e.target.value)}
                placeholder="e.g. Code Ninjas, LeetCode Grind"
                required
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
              />
              <p className="text-[11px] text-[#6e7681] mt-1">
                Creates a brand new squad and generates a shareable Squad ID for your team.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !squadNameInput.trim()}
              className="w-full py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Create Squad</span>
            </button>
          </form>
        )}

        {/* Message Notice */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-[#22c55e]/10 border-[#22c55e]/25 text-[#22c55e]'
                : 'bg-red-500/10 border-red-500/25 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquadManagerModal;
