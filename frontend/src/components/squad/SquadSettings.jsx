import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Shield, AlertTriangle, VolumeX, UserX, Copy, Check, Loader2, LogOut, Flag, MessageSquare } from 'lucide-react';

export default function SquadSettings() {
  const { session } = useAuth();
  const { activeSquad, members, leaveSquad, fetchSquadData } = useSquadStore();

  const [copied, setCopied] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [discordUsername, setDiscordUsername] = useState('');
  const [updatingDiscordUser, setUpdatingDiscordUser] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isAdmin = activeSquad?.role === 'admin' || activeSquad?.role === 'leader';

  const handleCopyCode = () => {
    const code = activeSquad?.invite_code || activeSquad?.code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    if (!activeSquad) return;
    if (!window.confirm('Are you sure you want to leave your squad?')) return;
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
        setFeedback({ type: 'success', text: 'Discord server channels connected successfully!' });
        fetchSquadData(activeSquad.id);
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to connect Discord server.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Discord connection failed.' });
    } finally {
      setDiscordLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* Feedback */}
      {feedback && (
        <div className={`p-3 rounded-xl text-xs font-bold ${feedback.type === 'success' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {feedback.text}
        </div>
      )}

      {/* Squad Info & Invite Code */}
      <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#22c55e]" />
          Squad Information & Invite Code
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl">
          <div>
            <h4 className="text-sm font-bold text-white">{activeSquad?.name}</h4>
            <p className="text-xs text-[#8b949e]">{activeSquad?.goal || activeSquad?.description || 'No goal set'}</p>
          </div>
          <button onClick={handleCopyCode} className="flex items-center gap-2 px-4 py-2 bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#22c55e] rounded-xl text-xs font-bold transition-all border border-[#22c55e]/30">
            <span className="font-mono">{activeSquad?.invite_code || activeSquad?.code}</span>
            {copied ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Admin Gated Discord Connection */}
      {isAdmin && (
        <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Discord Squad Integration (Admin)
          </h3>
          <p className="text-xs text-[#8b949e]">Automatically provision dedicated text and voice channels for this squad on GrindFam Discord server.</p>
          <button
            onClick={handleConnectDiscord}
            disabled={discordLoading || Boolean(activeSquad?.discord_invite_url)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {discordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            {activeSquad?.discord_invite_url ? 'Discord Channels Connected' : 'Connect Discord Server'}
          </button>
        </div>
      )}

      {/* Squad Roster */}
      <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#22c55e]" />
          Squad Roster
        </h3>
        <div className="space-y-2">
          {members.map((m) => {
            const isMe = m.user_id === session?.user?.id;
            return (
              <div key={m.user_id} className="p-3 bg-[#0d1117] border border-[#21262d] rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22c55e] to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {(m.name || 'M')[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{m.name}{isMe ? ' (You)' : ''}</span>
                    {(m.role === 'admin' || m.role === 'leader') && (
                      <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">ADMIN</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>
        <p className="text-xs text-[#8b949e]">Leaving the squad will revoke your access to squad chat and challenges.</p>
        <button onClick={handleLeave} className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Leave Squad
        </button>
      </div>
    </div>
  );
}
