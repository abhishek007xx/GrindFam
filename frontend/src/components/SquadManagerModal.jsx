import React, { useState } from 'react';
import { X, Users, PlusCircle, LogIn, LogOut, Copy, Check, Shield, Hash, Loader2, Compass } from 'lucide-react';

const SquadManagerModal = ({ isOpen, onClose, squadInfo, onCreateSquad, onJoinSquad, onLeaveSquad }) => {
  const [activeTab, setActiveTab] = useState('join'); // 'join' | 'create'
  const [squadType, setSquadType] = useState('private'); // 'private' | 'community'
  const [squadNameInput, setSquadNameInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [squadCodeInput, setSquadCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    const code = squadInfo?.invite_code || squadInfo?.code || squadInfo?.id;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!squadNameInput.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      await onCreateSquad({
        name: squadNameInput.trim(),
        squad_type: squadType,
        description: descriptionInput.trim() || null
      });
      setMessage({ type: 'success', text: 'Squad created successfully!' });
      setSquadNameInput('');
      setDescriptionInput('');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create squad.' });
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
      await onJoinSquad(squadCodeInput.trim());
      setMessage({ type: 'success', text: 'Joined squad successfully!' });
      setSquadCodeInput('');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to join squad.' });
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
      setMessage({ type: 'error', text: err.message || 'Failed to leave squad.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md p-6 border border-[#30363d] rounded-2xl shadow-2xl bg-[#0d1117] text-[#e6edf3]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#21262d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#22c55e]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Squad Manager</h2>
              <p className="text-xs text-[#8b949e]">Create or join a private or community squad</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Squad Info Widget */}
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

            {/* Invite Code & Link Box */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d1117] border border-[#21262d]">
                <div className="flex items-center gap-2 min-w-0">
                  <Hash className="w-4 h-4 text-[#6e7681] flex-shrink-0" />
                  <span className="text-xs text-[#8b949e]">Invite Code:</span>
                  <span className="font-mono text-sm font-bold text-[#22c55e] truncate">{squadInfo.invite_code || squadInfo.code}</span>
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
                    const code = squadInfo.invite_code || squadInfo.code;
                    const url = `${window.location.origin}/?joinSquad=${code}`;
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-[#22c55e] border border-[#22c55e]/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-[#161b22] border border-[#30363d] rounded-xl p-1 my-4">
          <button onClick={() => setActiveTab('join')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'join' ? 'bg-[#22c55e] text-white' : 'text-[#8b949e]'}`}>
            <LogIn className="w-3.5 h-3.5" /> Join Squad
          </button>
          <button onClick={() => setActiveTab('create')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'create' ? 'bg-[#22c55e] text-white' : 'text-[#8b949e]'}`}>
            <PlusCircle className="w-3.5 h-3.5" /> Create Squad
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-bold mb-4 ${message.type === 'success' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'join' ? (
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              value={squadCodeInput}
              onChange={(e) => setSquadCodeInput(e.target.value)}
              placeholder="Enter Squad Invite Code (e.g. A1B2C3D4)"
              className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-white placeholder-[#6e7681] text-center font-mono uppercase tracking-widest focus:outline-none focus:border-[#22c55e]"
              required
            />
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#1ea34d] text-white font-bold text-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Join Squad
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Squad Type Card Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSquadType('private')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  squadType === 'private'
                    ? 'bg-[#22c55e]/15 border-[#22c55e]/50 ring-1 ring-[#22c55e]/30'
                    : 'bg-[#161b22] border-[#30363d]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                  <Shield className="w-3.5 h-3.5 text-[#22c55e]" /> Private
                </div>
                <p className="text-[10px] text-[#8b949e]">Close friends (max 10 members)</p>
              </button>

              <button
                type="button"
                onClick={() => setSquadType('community')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  squadType === 'community'
                    ? 'bg-purple-500/15 border-purple-500/50 ring-1 ring-purple-500/30'
                    : 'bg-[#161b22] border-[#30363d]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                  <Compass className="w-3.5 h-3.5 text-purple-400" /> Community
                </div>
                <p className="text-[10px] text-[#8b949e]">Public group (max 100 members)</p>
              </button>
            </div>

            <input
              type="text"
              value={squadNameInput}
              onChange={(e) => setSquadNameInput(e.target.value)}
              placeholder="Squad Name"
              className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-white placeholder-[#6e7681] focus:outline-none focus:border-[#22c55e]"
              required
            />

            <input
              type="text"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Description / Goal (e.g. Amazon SDE-1 Oct 2026)"
              className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-white placeholder-[#6e7681] focus:outline-none focus:border-[#22c55e]"
            />

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#1ea34d] text-white font-bold text-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              Create Squad
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SquadManagerModal;
