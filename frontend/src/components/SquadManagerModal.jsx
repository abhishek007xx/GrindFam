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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-[440px] bg-[#36393f] rounded-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="text-xl font-bold text-white">
            {activeTab === 'create' ? 'Create a Squad' : 'Join a Squad'}
          </h2>
          <button onClick={onClose} className="text-[#72767d] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {activeSquad && (
          <div className="mx-4 mt-4 p-3 bg-[#2f3136] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-[#5865f2] flex items-center justify-center text-white text-xs font-bold">
                  {(activeSquad.name || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">{activeSquad.name}</span>
                  <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded text-white ${activeSquad.squad_type === 'community' ? 'bg-[#3ba55d]' : 'bg-[#5865f2]'}`}>
                    {activeSquad.squad_type === 'community' ? 'PUBLIC' : 'PRIVATE'}
                  </span>
                </div>
              </div>
              <button onClick={handleLeave} disabled={loading}
                className="text-[11px] font-medium text-[#ed4245] hover:text-white hover:bg-[#ed4245] px-2 py-1 rounded transition-colors flex items-center gap-1">
                <LogOut className="w-3 h-3" /> Leave
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={handleCopyCode}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#40444b] hover:bg-[#4f545c] text-[#dcddde] rounded text-xs font-medium transition-colors">
                {copied ? <Check className="w-3 h-3 text-[#3ba55d]" /> : <Hash className="w-3 h-3" />}
                {copied ? 'Copied!' : activeSquad.invite_code || activeSquad.code}
              </button>
              <button onClick={handleCopyLink}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-xs font-medium transition-colors">
                {copiedLink ? <Check className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                {copiedLink ? 'Copied!' : 'Invite Link'}
              </button>
            </div>
          </div>
        )}

        <div className="flex mx-4 mt-4 bg-[#2f3136] rounded-lg p-0.5">
          <button onClick={() => setActiveTab('join')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'join' ? 'bg-[#5865f2] text-white' : 'text-[#96989d] hover:text-[#dcddde]'}`}>
            <LogIn className="w-4 h-4" /> Join Squad
          </button>
          <button onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'create' ? 'bg-[#5865f2] text-white' : 'text-[#96989d] hover:text-[#dcddde]'}`}>
            <Plus className="w-4 h-4" /> Create Squad
          </button>
        </div>

        {message && (
          <div className={`mx-4 mt-3 p-2 rounded text-xs font-medium ${message.type === 'success' ? 'bg-[#3ba55d]/20 text-[#3ba55d]' : 'bg-[#ed4245]/20 text-[#ed4245]'}`}>
            {message.text}
          </div>
        )}

        <div className="p-4">
          {activeTab === 'join' ? (
            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-[#b9bbbe] mb-2 block">Invite Code</label>
                <input type="text" value={squadCodeInput} onChange={(e) => setSquadCodeInput(e.target.value)}
                  placeholder="A1B2C3D4" required
                  className="w-full px-3 py-2.5 bg-[#202225] border border-[#040405] rounded text-[15px] text-white placeholder-[#72767d] font-mono uppercase tracking-widest text-center focus:outline-none focus:border-[#5865f2]" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm font-medium disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Join Squad
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-[#b9bbbe] mb-2 block">Squad Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setSquadType('private')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${squadType === 'private' ? 'border-[#5865f2] bg-[#5865f2]/10' : 'border-[#40444b] bg-[#2f3136] hover:border-[#4f545c]'}`}>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-white mb-0.5">
                      <Lock className="w-4 h-4 text-[#5865f2]" /> Private
                    </div>
                    <p className="text-[11px] text-[#96989d]">Friends only · Max 10</p>
                  </button>
                  <button type="button" onClick={() => setSquadType('community')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${squadType === 'community' ? 'border-[#3ba55d] bg-[#3ba55d]/10' : 'border-[#40444b] bg-[#2f3136] hover:border-[#4f545c]'}`}>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-white mb-0.5">
                      <Globe className="w-4 h-4 text-[#3ba55d]" /> Community
                    </div>
                    <p className="text-[11px] text-[#96989d]">Public · Max 100</p>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#b9bbbe] mb-2 block">Squad Name</label>
                <input type="text" value={squadNameInput} onChange={(e) => setSquadNameInput(e.target.value)}
                  placeholder="e.g. LeetCode Legends" required
                  className="w-full px-3 py-2.5 bg-[#202225] border border-[#040405] rounded text-[15px] text-white placeholder-[#72767d] focus:outline-none focus:border-[#5865f2]" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#b9bbbe] mb-2 block">Goal / Description</label>
                <input type="text" value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="e.g. Amazon SDE-1 Oct 2026"
                  className="w-full px-3 py-2.5 bg-[#202225] border border-[#040405] rounded text-[15px] text-white placeholder-[#72767d] focus:outline-none focus:border-[#5865f2]" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm font-medium disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Squad
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
