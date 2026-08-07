import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, AlertTriangle, VolumeX, UserX, Copy, Check, Loader2, LogOut, Flag } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function SquadSettings({ squadInfo, members, role, onRefresh }) {
  const { session, profile } = useAuth();
  const [reportingUser, setReportingUser] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const token = session?.access_token;
  const isAdmin = role === 'leader';

  const handleCopyCode = () => {
    const code = squadInfo?.code || squadInfo?.id;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave your squad?')) return;
    try {
      await fetch(`${API_BASE}/api/squads/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh?.();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to leave squad.' });
    }
  };

  const handleMute = async (userId) => {
    if (!isAdmin) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_BASE}/api/squads/mute/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFeedback({ type: 'success', text: data.message });
      onRefresh?.();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to mute/unmute member.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleKick = async (userId) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_BASE}/api/squads/kick/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFeedback({ type: 'success', text: data.message });
      onRefresh?.();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to remove member.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportingUser || !reportReason.trim()) return;
    setReportLoading(true);
    try {
      await fetch(`${API_BASE}/api/squads/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reported_user_id: reportingUser, reason: reportReason.trim() })
      });
      setFeedback({ type: 'success', text: 'Report submitted. Squad admins will review.' });
      setReportingUser(null);
      setReportReason('');
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to submit report.' });
    } finally {
      setReportLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback && (
        <div className={`p-3 rounded-xl text-xs font-bold ${feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {feedback.text}
        </div>
      )}

      {/* Squad Info */}
      <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Squad Information & Invite Code
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl">
          <div>
            <h4 className="text-sm font-bold text-white">{squadInfo?.name}</h4>
            <p className="text-xs text-[#8b949e]">{squadInfo?.goal || 'No target goal set'}</p>
          </div>
          <button onClick={handleCopyCode} className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-500/30">
            <span className="font-mono">{squadInfo?.code}</span>
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Member Management & Moderation */}
      <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Squad Roster & Moderation
        </h3>

        <div className="space-y-2">
          {members.map((m) => {
            const isMe = m.id === profile?.id;
            return (
              <div key={m.id} className="p-3 bg-[#0d1117] border border-[#21262d] rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {getInitials(m.name)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{m.name}{isMe ? ' (You)' : ''}</span>
                    {m.role === 'leader' && <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">LEADER</span>}
                    {m.is_muted && <span className="ml-2 text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/30">MUTED</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isMe && (
                    <button onClick={() => setReportingUser(m.id)} className="p-1.5 bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-amber-400 rounded-lg transition-colors" title="Report Member">
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isAdmin && !isMe && (
                    <>
                      <button onClick={() => handleMute(m.id)} disabled={actionLoading === m.id} className="p-1.5 bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-amber-400 rounded-lg transition-colors" title={m.is_muted ? 'Unmute' : 'Mute'}>
                        <VolumeX className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleKick(m.id)} disabled={actionLoading === m.id} className="p-1.5 bg-[#161b22] hover:bg-red-500/20 text-[#8b949e] hover:text-red-400 rounded-lg transition-colors" title="Kick Member">
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Modal */}
      {reportingUser && (
        <form onSubmit={handleReport} className="p-5 bg-[#161b22] border border-amber-500/40 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Report Member to Squad Moderation
          </h4>
          <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Reason for reporting..." rows={3} className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-amber-500/50" required />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setReportingUser(null)} className="px-3 py-1.5 text-xs text-[#8b949e] hover:text-white">Cancel</button>
            <button type="submit" disabled={reportLoading} className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold">
              {reportLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}

      {/* Danger Zone */}
      <div className="p-5 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>
        <p className="text-xs text-[#8b949e]">Leaving the squad will remove your access to the squad chat, shared code, and weekly challenges.</p>
        <button onClick={handleLeave} className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Leave Squad
        </button>
      </div>
    </div>
  );
}
