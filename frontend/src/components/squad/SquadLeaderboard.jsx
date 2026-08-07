import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Trophy, Flame, HelpCircle, Loader2, Award, Crown } from 'lucide-react';
import { supabase } from '../../supabase';

export default function SquadLeaderboard() {
  const { profile } = useAuth();
  const { activeSquad, members } = useSquadStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSquad || members.length === 0) { setLoading(false); return; }

    const buildLeaderboard = async () => {
      setLoading(true);
      try {
        const userIds = members.map(m => m.user_id);

        // Fetch solved problems with problem details for difficulty point calculation
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('user_id, solved_at, problem_id, problems(difficulty)')
          .in('user_id', userIds)
          .eq('status', 'solved');

        // Aggregate points, solved count, and calculate streak per user
        const statsMap = {};
        userIds.forEach(uid => { statsMap[uid] = { solved: 0, points: 0, dates: [] }; });

        (progressData || []).forEach(p => {
          if (statsMap[p.user_id]) {
            statsMap[p.user_id].solved += 1;
            const diff = p.problems?.difficulty || 'Easy';
            const pts = diff === 'Hard' ? 35 : diff === 'Medium' ? 20 : 10;
            statsMap[p.user_id].points += pts;
            if (p.solved_at) {
              statsMap[p.user_id].dates.push(p.solved_at.split('T')[0]);
            }
          }
        });

        // Snippet help points
        const { data: snippetData } = await supabase
          .from('squad_code_snippets').select('user_id').eq('squad_id', activeSquad.id);

        const helpsMap = {};
        (snippetData || []).forEach(s => { helpsMap[s.user_id] = (helpsMap[s.user_id] || 0) + 1; });

        const entries = members.map(m => {
          const userStat = statsMap[m.user_id] || { solved: 0, points: 0, dates: [] };
          const helps = helpsMap[m.user_id] || 0;
          const totalPoints = userStat.points + (helps * 5);

          // Compute streak
          const sortedDates = [...new Set(userStat.dates)].sort();
          let streak = 0;
          if (sortedDates.length > 0) {
            streak = 1;
            for (let i = sortedDates.length - 1; i > 0; i--) {
              const curr = new Date(sortedDates[i]);
              const prev = new Date(sortedDates[i - 1]);
              const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
              if (diffDays === 1) streak++;
              else break;
            }
          }

          return {
            userId: m.user_id,
            name: m.name || 'Grinder',
            role: m.role,
            solved: userStat.solved,
            streak,
            helps,
            points: totalPoints
          };
        });

        entries.sort((a, b) => b.points - a.points);
        entries.forEach((e, i) => { e.rank = i + 1; });
        setLeaderboard(entries);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    buildLeaderboard();
  }, [activeSquad, members]);

  const getInitial = (name) => (name || '?')[0].toUpperCase();
  const topThree = leaderboard.slice(0, 3);
  const remainingList = leaderboard.slice(3);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-[#22c55e] animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ff8b7c]" /> Squad Leaderboard
        </h3>
        <span className="text-xs text-[#869585]">Points: Easy=10, Med=20, Hard=35</span>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-16 bg-[#1a221a] border border-[#3d4a3d] rounded-2xl">
          <Trophy className="w-12 h-12 text-[#3d4a3d] mx-auto mb-3" />
          <p className="text-sm font-bold text-white">No leaderboard activity yet</p>
          <p className="text-xs text-[#869585] mt-1">Solve problems to climb the squad ranks!</p>
        </div>
      ) : (
        <>
          {/* Podium for Top 3 */}
          <div className="grid grid-cols-3 gap-3 pt-4 pb-2">
            {/* Rank 2 */}
            {/* Rank 2 */}
            {topThree[1] ? (
              <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-lg flex flex-col items-center justify-end text-center mt-6">
                <Award className="w-6 h-6 text-slate-300 mb-1" />
                <div className="w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white font-bold text-sm mb-2">
                  {getInitial(topThree[1].name)}
                </div>
                <span className="text-xs font-bold text-white truncate max-w-full">{topThree[1].name}</span>
                <span className="text-sm font-extrabold text-slate-300 mt-1">{topThree[1].points} pts</span>
              </div>
            ) : <div />}

            {/* Rank 1 */}
            {topThree[0] ? (
              <div className="p-5 bg-[#18181B] border-2 border-[#EA5D3A]/50 rounded-lg flex flex-col items-center justify-end text-center shadow-lg shadow-[#EA5D3A]/10">
                <Trophy className="w-8 h-8 text-[#EA5D3A] mb-1" />
                <div className="w-12 h-12 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white font-extrabold text-base mb-2">
                  {getInitial(topThree[0].name)}
                </div>
                <span className="text-sm font-extrabold text-white truncate max-w-full">{topThree[0].name}</span>
                <span className="text-base font-black text-[#EA5D3A] mt-1">{topThree[0].points} pts</span>
              </div>
            ) : <div />}

            {/* Rank 3 */}
            {topThree[2] ? (
              <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-lg flex flex-col items-center justify-end text-center mt-8">
                <Award className="w-6 h-6 text-amber-600 mb-1" />
                <div className="w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white font-bold text-sm mb-2">
                  {getInitial(topThree[2].name)}
                </div>
                <span className="text-xs font-bold text-white truncate max-w-full">{topThree[2].name}</span>
                <span className="text-sm font-extrabold text-amber-600 mt-1">{topThree[2].points} pts</span>
              </div>
            ) : <div />}
          </div>

          {/* Full Table */}
          <div className="space-y-2">
            {leaderboard.map((m) => {
              const isMe = m.userId === profile?.id;
              return (
                <div
                  key={m.userId}
                  className={`p-3.5 rounded-lg border flex items-center justify-between gap-4 transition-all ${
                    isMe
                      ? 'bg-[#EA5D3A]/10 border-[#EA5D3A]/40'
                      : 'bg-[#121215] border-[#27272A]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-sm font-bold text-[#9CA3AF] w-6 text-center">#{m.rank}</span>
                    <div className="w-8 h-8 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {getInitial(m.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{m.name}</span>
                        {isMe && <span className="text-[9px] bg-[#EA5D3A]/20 text-[#EA5D3A] px-1.5 py-0.5 rounded font-bold">YOU</span>}
                        {m.role === 'admin' && <Crown className="w-3.5 h-3.5 text-amber-400" title="Admin" />}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[#869585] mt-0.5">
                        <span className="text-[#22c55e] font-semibold">{m.solved} Solved</span>
                        <span>•</span>
                        <span className="text-[#ff8b7c] font-semibold flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> {m.streak}d streak
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-base font-extrabold text-[#22c55e]">{m.points}</span>
                    <span className="text-[10px] text-[#869585] block font-semibold uppercase">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
