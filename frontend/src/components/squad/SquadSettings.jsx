import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Shield, AlertTriangle, Copy, Check, Loader2, LogOut, MessageSquare, Trash2, Save } from 'lucide-react';

export default function SquadSettings() {
  const { session } = useAuth();
  const { activeSquad, members, leaveSquad, updateSquadSettings, deleteSquad, fetchSquadData } = useSquadStore();

  const [name, setName] = useState(activeSquad?.name || '');
  const [goal, setGoal] = useState(activeSquad?.goal || '');
  const [description, setDescription] = useState(activeSquad?.description || '');
  const [squadType, setSquadType] = useState(activeSquad?.squad_type || 'private');

  const [copied, setCopied] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isAdmin = activeSquad?.role === 'admin';

  const handleCopyCode = () => {
    const code = activeSquad?.invite_code || activeSquad?.code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin || !activeSquad) return;
    setSaving(true);
    setFeedback(null);
    try {
      await updateSquadSettings(activeSquad.id, {
        name: name.trim(),
        goal: goal.trim() || null,
        description: description.trim() || null,
        squad_type: squadType
      });
      setFeedback({ type: 'success', text: 'Squad settings updated!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !activeSquad) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${activeSquad.name}"? This cannot be undone.`)) return;
    try {
      await deleteSquad(activeSquad.id);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete squad.' });
    }
  };

  const handleLeave = async () => {
    if (!activeSquad) return;
    if (!window.confirm('Are you sure you want to leave this squad?')) return;
    try {
      await leaveSquad(activeSquad.id);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to leave squad.' });
    }
  };

  const handleConnectDiscord = async () => {
    if (!isAdmin || !activeSquad) return;
    setDiscordLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/discord/create-squad-channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          squadId: activeSquad.id,
          squadName: activeSquad.name
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Discord channels connected!' });
        fetchSquadData(activeSquad.id);
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to connect Discord.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Discord connection failed.' });
    } finally {
      setDiscordLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-[#dce5d9]">
      {feedback && (
        <div className={`p-3 rounded-xl text-xs font-bold ${
          feedback.type === 'success' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' : 'bg-[#ff8b7c]/20 text-[#ff8b7c] border border-[#ff8b7c]/30'
        }`}>
          {feedback.text}
        </div>
      )}

      {/* Invite Code Box */}
      <div className="p-5 bg-[#1a221a] border border-[#3d4a3d] rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#22c55e]" /> Squad Invite Code
        </h3>
        <div className="flex items-center justify-between p-3 bg-[#091009] border border-[#3d4a3d] rounded-xl">
          <div>
            <span className="text-xs text-[#869585] block">Share Code:</span>
            <span className="font-mono text-base font-bold text-[#22c55e]">{activeSquad?.invite_code || activeSquad?.code}</span>
          </div>
          <button onClick={handleCopyCode} className="px-3 py-1.5 bg-[#22c55e] hover:bg-[#1ea34d] text-[#0e150e] rounded-lg text-xs font-bold flex items-center gap-1">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Admin Settings Form */}
      {isAdmin ? (
        <form onSubmit={handleSave} className="p-5 bg-[#1a221a] border border-[#3d4a3d] rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Save className="w-4 h-4 text-[#22d3ee]" /> Edit Squad Details (Admin)
          </h3>

          <div>
            <label className="text-xs text-[#869585] block mb-1">Squad Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#091009] border border-[#3d4a3d] rounded-xl text-sm text-white focus:outline-none focus:border-[#22c55e]"
              required
            />
          </div>

          <div>
            <label className="text-xs text-[#869585] block mb-1">Goal (e.g. Amazon SDE Prep)</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2 bg-[#091009] border border-[#3d4a3d] rounded-xl text-sm text-white focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          <div>
            <label className="text-xs text-[#869585] block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 bg-[#091009] border border-[#3d4a3d] rounded-xl text-xs text-white focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          <div>
            <label className="text-xs text-[#869585] block mb-1">Squad Visibility</label>
            <select
              value={squadType}
              onChange={(e) => setSquadType(e.target.value)}
              className="w-full px-3 py-2 bg-[#091009] border border-[#3d4a3d] rounded-xl text-sm text-white focus:outline-none focus:border-[#22c55e]"
            >
              <option value="private">Private (Friends, max 10)</option>
              <option value="community">Community (Public, max 100)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-[#22c55e] hover:bg-[#1ea34d] text-[#0e150e] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </form>
      ) : (
        /* Read Only view for non-admins */
        <div className="p-5 bg-[#1a221a] border border-[#3d4a3d] rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Squad Overview</h3>
          <p className="text-sm font-semibold text-white">{activeSquad?.name}</p>
          <p className="text-xs text-[#869585]">{activeSquad?.description || activeSquad?.goal || 'No description set'}</p>
        </div>
      )}

      {/* Discord Connection */}
      {isAdmin && (
        <div className="p-5 bg-[#1a221a] border border-[#3d4a3d] rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" /> Discord Squad Integration
          </h3>
          <p className="text-xs text-[#869585]">Provision dedicated channels on GrindFam Discord server.</p>
          <button
            onClick={handleConnectDiscord}
            disabled={discordLoading || Boolean(activeSquad?.discord_invite_url)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-2"
          >
            {discordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            {activeSquad?.discord_invite_url ? 'Discord Connected' : 'Connect Discord Server'}
          </button>
        </div>
      )}

      {/* Danger Zone */}
      <div className="p-5 bg-[#ff8b7c]/10 border border-[#ff8b7c]/30 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-[#ff8b7c] uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleLeave} className="px-4 py-2 bg-[#ff8b7c]/20 hover:bg-[#ff8b7c]/30 text-[#ff8b7c] rounded-xl text-xs font-bold flex items-center gap-2 border border-[#ff8b7c]/30">
            <LogOut className="w-4 h-4" /> Leave Squad
          </button>
          {isAdmin && (
            <button onClick={handleDelete} className="px-4 py-2 bg-[#ff8b7c] hover:bg-[#e07567] text-white rounded-xl text-xs font-bold flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Squad
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
