import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Flame, HelpCircle, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function SquadLeaderboard() {
  const { session, profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = session?.access_token;

  const fetchLeaderboard = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/squads/leaderboard`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankGradient = (rank) => {
    if (rank === 1) return 'from-amber-500/20 to-yellow-600/10 border-amber-500/40';
    if (rank === 2) return 'from-[#30363d] to-[#161b22] border-[#30363d]';
    if (rank === 3) return 'from-emerald-950/20 to-teal-950/10 border-emerald-500/30';
    return 'from-transparent to-transparent border-[#30363d]';
  };

  const maxPoints = leaderboard.length > 0 ? (leaderboard[0].points || 1) : 1;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400" />
        Squad Leaderboard
      </h3>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12 bg-[#161b22]/40 border border-[#30363d] rounded-2xl">
          <Trophy className="w-10 h-10 text-[#30363d] mx-auto mb-3" />
          <p className="text-sm text-[#8b949e]">No leaderboard data yet. Start solving problems!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((member) => {
            const isMe = member.userId === profile?.id;
            return (
              <div key={member.userId} className={`p-4 rounded-2xl border bg-gradient-to-r ${getRankGradient(member.rank)} ${isMe ? 'ring-1 ring-emerald-500/50 border-emerald-500/40' : ''} transition-all hover:scale-[1.01]`}>
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className="text-2xl font-black min-w-[40px] text-center">
                    {getMedal(member.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(member.name)}
                  </div>

                  {/* Name & Stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{member.name}</span>
                      {isMe && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">YOU</span>}
                      {member.role === 'leader' && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">LEADER</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <Flame className="w-3 h-3" />
                        {member.weekly_solved} solved
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-teal-400">
                        <HelpCircle className="w-3 h-3" />
                        {member.helps} code helps
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, (member.points / maxPoints) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400">{member.points}</span>
                    <p className="text-[9px] text-[#6e7681] uppercase font-bold">Points</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
