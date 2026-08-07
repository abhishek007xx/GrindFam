import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Trophy, Flame, HelpCircle, Loader2, Hash } from 'lucide-react';
import { supabase } from '../../supabase';

export default function SquadLeaderboard() {
  const { profile } = useAuth();
  const { activeSquad, members } = useSquadStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSquad || members.length === 0) { setLoading(false); return; }

    const build = async () => {
      setLoading(true);
      try {
        const userIds = members.map(m => m.user_id);
        const { data: progressData } = await supabase
          .from('user_progress').select('user_id, status')
          .in('user_id', userIds).eq('status', 'solved');

        const solvedMap = {};
        (progressData || []).forEach(p => { solvedMap[p.user_id] = (solvedMap[p.user_id] || 0) + 1; });

        const { data: snippetData } = await supabase
          .from('squad_code_snippets').select('user_id').eq('squad_id', activeSquad.id);

        const helpsMap = {};
        (snippetData || []).forEach(s => { helpsMap[s.user_id] = (helpsMap[s.user_id] || 0) + 1; });

        const entries = members.map(m => {
          const solved = solvedMap[m.user_id] || 0;
          const helps = helpsMap[m.user_id] || 0;
          return { userId: m.user_id, name: m.name || 'Grinder', role: m.role, weekly_solved: solved, helps, points: (solved * 10) + (helps * 5) };
        });
        entries.sort((a, b) => b.points - a.points);
        entries.forEach((e, i) => { e.rank = i + 1; });
        setLeaderboard(entries);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    build();
  }, [activeSquad, members]);

  const getInitial = (name) => (name || '?')[0].toUpperCase();
  const getMedal = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;
  const maxPoints = leaderboard.length > 0 ? (leaderboard[0].points || 1) : 1;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-[#5865f2] animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
        <Trophy className="w-4 h-4 text-[#faa61a]" /> Squad Leaderboard
      </h3>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <Hash className="w-10 h-10 text-[#40444b] mx-auto mb-3" />
          <p className="text-sm text-[#96989d]">No data yet. Start solving!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((m) => {
            const isMe = m.userId === profile?.id;
            return (
              <div key={m.userId} className={`p-3 rounded-lg flex items-center gap-3 transition-colors hover:bg-[#42464d] ${isMe ? 'bg-[#42464d] ring-1 ring-[#5865f2]/40' : 'bg-[#2f3136]'}`}>
                <span className="text-xl font-black min-w-[36px] text-center">{getMedal(m.rank)}</span>
                <div className="w-9 h-9 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getInitial(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white truncate">{m.name}</span>
                    {isMe && <span className="text-[9px] bg-[#5865f2]/30 text-[#5865f2] px-1.5 py-0.5 rounded font-bold">YOU</span>}
                    {m.role === 'admin' && <span className="text-[10px]">👑</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-[#3ba55d] flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {m.weekly_solved} solved
                    </span>
                    <span className="text-[11px] text-[#96989d] flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" /> {m.helps} helps
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 bg-[#202225] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#5865f2] transition-all duration-500"
                      style={{ width: `${Math.min(100, (m.points / maxPoints) * 100)}%` }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-bold text-[#5865f2]">{m.points}</span>
                  <p className="text-[9px] text-[#72767d] uppercase font-bold">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
