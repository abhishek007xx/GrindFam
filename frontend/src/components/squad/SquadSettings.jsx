import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, AlertTriangle, VolumeX, UserX, Copy, Check, Pencil, Loader2 } from 'lucide-react';

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
        <div className={`p-3 rounded-xl text-xs font-bold ${feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {feedback.text}
        </div>
      )}

      {/* Squad Info */}
      <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#8b949e]" />
          Squad Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-[#6e7681] uppercase tracking-wider font-bold">Squad Name</span>
            <p className="text-sm text-white font-bold mt-1">{squadInfo?.name || 'Unknown'}</p>
          </div>
          <div>
            <span className="text-[10px] text-[#6e7681] uppercase tracking-wider font-bold">Goal</span>
            <p className="text-xs text-[#8b949e] mt-1">{squadInfo?.goal || 'No goal set'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#6e7681] uppercase tracking-wider font-bold">Invite Code:</span>
          <span className="px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-indigo-400 font-mono font-bold">
            {squadInfo?.code || squadInfo?.id?.slice(0, 8) || '—'}
          </span>
          <button onClick={handleCopyCode} className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] transition-all">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Members Management */}
      <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          Members ({members?.length || 0}/{squadInfo?.max_members || 10})
        </h3>

        <div className="space-y-2">
          {(members || []).map(member => {
            const isMe = member.id === profile?.id;
            return (
              <div key={member.id} className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#21262d] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{member.name}{isMe ? ' (You)' : ''}</span>
                      {member.role === 'leader' && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">LEADER</span>}
                      {member.is_muted && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">MUTED</span>}
                    </div>
                    <span className="text-[10px] text-[#6e7681]">@{member.username || '—'}</span>
                  </div>
                </div>

                {/* Admin Actions */}
                {isAdmin && !isMe && member.role !== 'leader' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMute(member.id)}
                      disabled={actionLoading === member.id}
                      className={`p-1.5 rounded-lg ${member.is_muted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} hover:opacity-80 transition-all`}
                      title={member.is_muted ? 'Unmute' : 'Mute'}
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleKick(member.id)}
                      disabled={actionLoading === member.id}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:opacity-80 transition-all"
                      title="Remove member"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setReportingUser(member.id); }}
                      className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:opacity-80 transition-all"
                      title="Report"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Report for non-admin */}
                {!isAdmin && !isMe && (
                  <button
                    onClick={() => { setReportingUser(member.id); }}
                    className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:opacity-80 transition-all"
                    title="Report"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Form */}
      {reportingUser && (
        <form onSubmit={handleReport} className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Report Member
          </h4>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Describe the issue (toxicity, spam, harassment, etc.)..."
            rows={3}
            className="w-full px-3 py-2 bg-[#0d1117] border border-red-500/30 rounded-xl text-xs text-white placeholder-[#6e7681] resize-none focus:outline-none focus:border-red-500/50"
            required
          />
          <div className="flex items-center gap-2">
            <button type="submit" disabled={reportLoading} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-2">
              {reportLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              Submit Report
            </button>
            <button type="button" onClick={() => { setReportingUser(null); setReportReason(''); }} className="text-xs text-[#8b949e] hover:text-white">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
