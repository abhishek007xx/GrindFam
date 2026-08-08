import React, { useState } from 'react';
import { X, Lock, Globe, Plus, LogIn, Copy, Check, Hash, Loader2, LogOut, Link2 } from 'lucide-react';
import { useSquadStore } from '../store/useSquadStore';

export default function SquadManagerModal({ isOpen, onClose }) {
  const { activeSquad, createSquad, joinByCode, leaveSquad } = useSquadStore();
  const [activeTab, setActiveTab] = useState('join');
  const [squadType, setSquadType] = useState('private');
  const [squadNameInput, setSquadNameInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [squadCodeInput, setSquadCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    const code = activeSquad?.invite_code || activeSquad?.code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const code = activeSquad?.invite_code || activeSquad?.code;
    if (!code) return;
    navigator.clipboard.writeText(`${window.location.origin}/?joinSquad=${code}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!squadNameInput.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      await createSquad({ name: squadNameInput.trim(), squad_type: squadType, description: descriptionInput.trim() || null });
      setMessage({ type: 'success', text: 'Squad created!' });
      setSquadNameInput('');
      setDescriptionInput('');
      setTimeout(() => onClose(), 800);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create squad.' });
    } finally { setLoading(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!squadCodeInput.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      await joinByCode(squadCodeInput.trim());
      setMessage({ type: 'success', text: 'Joined squad!' });
      setSquadCodeInput('');
      setTimeout(() => onClose(), 800);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to join.' });
    } finally { setLoading(false); }
  };

  const handleLeave = async () => {
    if (!activeSquad || !window.confirm('Leave this squad?')) return;
    setLoading(true);
    try {
      await leaveSquad(activeSquad.id);
      setMessage({ type: 'success', text: 'Left squad.' });
      setTimeout(() => onClose(), 600);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to leave.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#1a221a] border border-[#3d4a3d] rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-[#3d4a3d]">
          <h2 className="text-lg font-bold text-white">
            {activeTab === 'create' ? 'Create a Squad' : 'Join a Squad'}
          </h2>
          <button onClick={onClose} className="text-[#869585] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeSquad && (
          <div className="p-4 bg-[#141414] border border-[#333333] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EA5D3A] flex items-center justify-center text-white text-xs font-bold">
                  {(activeSquad.name || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-bold text-white">{activeSquad.name}</span>
                  <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-[#EA5D3A]/20 text-[#EA5D3A]">
                    {activeSquad.squad_type || 'private'}
                  </span>
                </div>
              </div>
              <button onClick={handleLeave} disabled={loading}
                className="px-2 py-1 rounded text-xs font-bold text-[#ff8b7c] hover:bg-[#ff8b7c]/20 border border-[#ff8b7c]/30 flex items-center gap-1">
                <LogOut className="w-3 h-3" /> Leave
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopyCode}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#1E1E1E] border border-[#333333] text-[#dce5d9] rounded-lg text-xs font-semibold">
                {copied ? <Check className="w-3 h-3 text-[#EA5D3A]" /> : <Hash className="w-3 h-3" />}
                {copied ? 'Copied!' : activeSquad.invite_code || activeSquad.code}
              </button>
              <button onClick={handleCopyLink}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-[#EA5D3A] text-white hover:bg-[#f2704e] rounded-lg text-xs font-bold transition-all">
                {copiedLink ? <Check className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                {copiedLink ? 'Copied!' : 'Invite Link'}
              </button>
            </div>
          </div>
        )}

        <div className="flex bg-[#141414] border border-[#333333] rounded-xl p-1">
          <button onClick={() => setActiveTab('join')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'join' ? 'bg-[#EA5D3A] text-white' : 'text-zinc-400'}`}>
            <LogIn className="w-4 h-4" /> Join Squad
          </button>
          <button onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'create' ? 'bg-[#EA5D3A] text-white' : 'text-zinc-400'}`}>
            <Plus className="w-4 h-4" /> Create Squad
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-[#EA5D3A]/20 text-[#EA5D3A]' : 'bg-[#ff8b7c]/20 text-[#ff8b7c]'}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'join' ? (
          <form onSubmit={handleJoin} className="space-y-4">
            <input type="text" value={squadCodeInput} onChange={(e) => setSquadCodeInput(e.target.value)}
              placeholder="Enter Squad Invite Code (e.g. A1B2C3D4)" required
              className="w-full px-4 py-3 bg-[#141414] border border-[#333333] rounded-xl text-sm text-white placeholder-zinc-500 text-center font-mono uppercase tracking-widest focus:outline-none focus:border-[#EA5D3A]" />
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#EA5D3A] hover:bg-[#f2704e] text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Join Squad
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setSquadType('private')}
                className={`p-3 rounded-xl border text-left transition-all ${squadType === 'private' ? 'bg-[#EA5D3A]/15 border-[#EA5D3A]/50 ring-1 ring-[#EA5D3A]/30' : 'bg-[#141414] border-[#333333]'}`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                  <Lock className="w-3.5 h-3.5 text-[#EA5D3A]" /> 🔒 Private
                </div>
                <p className="text-[10px] text-zinc-400">Close friends (max 10)</p>
              </button>
              <button type="button" onClick={() => setSquadType('community')}
                className={`p-3 rounded-xl border text-left transition-all ${squadType === 'community' ? 'bg-[#22d3ee]/15 border-[#22d3ee]/50 ring-1 ring-[#22d3ee]/30' : 'bg-[#141414] border-[#333333]'}`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                  <Globe className="w-3.5 h-3.5 text-[#22d3ee]" /> 🌍 Community
                </div>
                <p className="text-[10px] text-zinc-400">Public prep (max 100)</p>
              </button>
            </div>
            <input type="text" value={squadNameInput} onChange={(e) => setSquadNameInput(e.target.value)}
              placeholder="Squad Name" required
              className="w-full px-4 py-3 bg-[#141414] border border-[#333333] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A]" />
            <input type="text" value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Description / Goal (e.g. Amazon SDE-1)"
              className="w-full px-4 py-3 bg-[#141414] border border-[#333333] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A]" />
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#EA5D3A] hover:bg-[#f2704e] text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Squad
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
