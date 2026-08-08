import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Target, Check, ThumbsUp, Loader2, Timer, Sparkles, Bell, Flame } from 'lucide-react';
import { supabase } from '../../supabase';

const PROBLEMS = [
  { slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy' },
  { slug: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy' },
  { slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy' },
  { slug: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
  { slug: 'binary-search', title: 'Binary Search', difficulty: 'Easy' },
  { slug: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
  { slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy' },
  { slug: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Medium' },
  { slug: 'coin-change', title: 'Coin Change', difficulty: 'Medium' },
  { slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
  { slug: 'product-of-array-except-self', title: 'Product of Array Except Self', difficulty: 'Medium' },
  { slug: '3sum', title: '3Sum', difficulty: 'Medium' },
  { slug: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium' },
  { slug: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium' },
  { slug: 'word-break', title: 'Word Break', difficulty: 'Medium' },
  { slug: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium' },
  { slug: 'serialize-and-deserialize-binary-tree', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard' },
  { slug: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard' },
  { slug: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays', difficulty: 'Hard' },
  { slug: 'merge-k-sorted-lists', title: 'Merge K Sorted Lists', difficulty: 'Hard' },
];

const diffColor = (d) => d === 'Easy' ? 'text-[#22c55e] bg-[#22c55e]/15 border border-[#22c55e]/30' : d === 'Medium' ? 'text-[#22d3ee] bg-[#22d3ee]/15 border border-[#22d3ee]/30' : 'text-[#ff8b7c] bg-[#ff8b7c]/15 border border-[#ff8b7c]/30';

export default function SquadWeeklyChallenge() {
  const { profile } = useAuth();
  const { activeSquad, challenges, members, sendMessage } = useSquadStore();
  const [loading, setLoading] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [voting, setVoting] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [weekStart, setWeekStart] = useState('');
  const [memberSolvedCounts, setMemberSolvedCounts] = useState({});

  useEffect(() => {
    if (!activeSquad) return;
    const today = new Date();
    const dow = today.getDay();
    const ws = new Date(today);
    ws.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    const wsStr = ws.toISOString().split('T')[0];
    setWeekStart(wsStr);

    const loadChallengeData = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('squad_weekly_challenges').select('*')
          .eq('squad_id', activeSquad.id).eq('week_start', wsStr).maybeSingle();
        setChallenge(data || (challenges?.length > 0 ? challenges[0] : null));

        // Member solved counts this week
        const userIds = members.map(m => m.user_id);
        if (userIds.length > 0) {
          const { data: progress } = await supabase.from('user_progress')
            .select('user_id').in('user_id', userIds).eq('status', 'solved');

          const counts = {};
          (progress || []).forEach(p => { counts[p.user_id] = (counts[p.user_id] || 0) + 1; });
          setMemberSolvedCounts(counts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadChallengeData();
  }, [activeSquad, challenges, members]);

  const handleVote = async () => {
    if (selectedProblems.length === 0 || !activeSquad || !profile?.id) return;
    setVoting(true);
    try {
      if (challenge) {
        const votes = { ...(challenge.votes || {}), [profile.id]: selectedProblems };
        const allVotes = Object.values(votes).flat();
        const tally = {};
        allVotes.forEach(s => { tally[s] = (tally[s] || 0) + 1; });
        const topProblems = Object.entries(tally).sort(([, a], [, b]) => b - a).slice(0, 5).map(([s]) => s);
        await supabase.from('squad_weekly_challenges').update({ votes, problems: topProblems }).eq('id', challenge.id);
        setChallenge({ ...challenge, votes, problems: topProblems });
      } else {
        const votes = { [profile.id]: selectedProblems };
        const { data } = await supabase.from('squad_weekly_challenges')
          .insert([{ squad_id: activeSquad.id, week_start: weekStart, problems: selectedProblems, votes }])
          .select().single();
        setChallenge(data);
      }
    } catch (err) { console.error(err); }
    finally { setVoting(false); }
  };

  const handleLogSolve = async () => {
    const userName = profile?.username || profile?.leetcode_username || 'Grinder';
    await sendMessage(`${userName} logged a solve 🔥`, 'system');
  };

  const handleNudgeMember = async (memberName) => {
    await sendMessage(`@${memberName} time to grind ⏰`, 'system');
  };

  const toggle = (slug) => {
    setSelectedProblems(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : prev.length < 5 ? [...prev, slug] : prev);
  };

  const getWeekEnd = () => {
    if (!weekStart) return '';
    const s = new Date(weekStart); const e = new Date(s); e.setDate(s.getDate() + 6);
    return e.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getDaysLeft = () => {
    if (!weekStart) return 0;
    const s = new Date(weekStart); const e = new Date(s); e.setDate(s.getDate() + 7);
    return Math.max(0, Math.ceil((e - new Date()) / 86400000));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-[#EA5D3A] animate-spin" /></div>;

  const totalSolvedSquad = Object.values(memberSolvedCounts).reduce((a, b) => a + b, 0);
  const targetCount = (challenge?.problems?.length || 5) * members.length;
  const progressPercent = targetCount > 0 ? Math.min(100, Math.round((totalSolvedSquad / targetCount) * 100)) : 0;
  const hasVoted = challenge?.votes?.[profile?.id];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#1E1E1E] border border-[#333333] rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#EA5D3A]" /> Squad Weekly Challenge
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Vote on 5 target LeetCode problems for your squad to tackle together this week.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogSolve}
            className="px-3.5 py-1.5 bg-[#EA5D3A] hover:bg-[#f2704e] text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4" /> Log a Solve
          </button>
          <div className="flex items-center gap-1.5 bg-[#EA5D3A]/10 px-3 py-1.5 rounded-xl border border-[#EA5D3A]/20 text-xs font-semibold text-[#EA5D3A]">
            <Timer className="w-4 h-4" /> {getDaysLeft()}d left (ends {getWeekEnd()})
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-5 bg-[#1E1E1E] border border-[#333333] rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-white">Squad Progress</span>
          <span className="text-[#EA5D3A]">{totalSolvedSquad} / {targetCount} solved ({progressPercent}%)</span>
        </div>
        <div className="h-2.5 bg-[#141414] rounded-full overflow-hidden border border-[#333333]">
          <div className="h-full bg-gradient-to-r from-[#EA5D3A] to-amber-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Member Progress & Nudge Rows */}
      <div className="p-5 bg-[#1E1E1E] border border-[#333333] rounded-2xl space-y-3">
        <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Member Progress This Week</h4>
        <div className="space-y-2">
          {members.map(m => {
            const count = memberSolvedCounts[m.user_id] || 0;
            return (
              <div key={m.user_id} className="p-3 bg-[#141414] border border-[#333333] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EA5D3A] flex items-center justify-center text-white text-xs font-bold">
                    {(m.name || 'G')[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{m.name}</span>
                    <span className="text-[10px] text-[#869585] block">{count} problems solved</span>
                  </div>
                </div>
                <button
                  onClick={() => handleNudgeMember(m.name)}
                  className="px-2.5 py-1 bg-[#1a221a] hover:bg-[#23272b] text-[#ff8b7c] border border-[#ff8b7c]/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Bell className="w-3.5 h-3.5" /> Nudge ⏰
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Problems */}
      {challenge?.problems?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-[#869585] tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#22c55e]" /> Target Problems ({challenge.problems.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {challenge.problems.map(slug => {
              const p = PROBLEMS.find(x => x.slug === slug) || { slug, title: slug, difficulty: 'Medium' };
              return (
                <div key={slug} className="p-4 bg-[#1a221a] border border-[#3d4a3d] rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{p.title}</h5>
                    <a href={`https://leetcode.com/problems/${slug}`} target="_blank" rel="noreferrer"
                      className="text-[10px] text-[#22c55e] hover:underline">View on LeetCode →</a>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${diffColor(p.difficulty)}`}>{p.difficulty}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vote Form */}
      <div className="p-5 bg-[#1a221a] border border-[#3d4a3d] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-[#22c55e]" />
            {hasVoted ? 'Your Vote Recorded ✓' : 'Select up to 5 Problems to Vote'}
          </h4>
          <span className="text-[10px] font-mono text-[#869585]">{selectedProblems.length}/5 selected</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {PROBLEMS.map(p => {
            const sel = selectedProblems.includes(p.slug);
            return (
              <button key={p.slug} onClick={() => toggle(p.slug)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sel ? 'border-[#22c55e] bg-[#22c55e]/10 ring-1 ring-[#22c55e]/30' : 'border-[#3d4a3d] bg-[#091009] hover:border-[#22c55e]/40'
                }`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white truncate">{p.title}</span>
                  {sel && <Check className="w-3.5 h-3.5 text-[#22c55e] flex-shrink-0" />}
                </div>
                <span className={`text-[9px] font-bold inline-block mt-2 px-2 py-0.5 rounded-full ${diffColor(p.difficulty)}`}>{p.difficulty}</span>
              </button>
            );
          })}
        </div>

        <button onClick={handleVote} disabled={selectedProblems.length === 0 || voting}
          className="w-full py-3 bg-[#22c55e] hover:bg-[#1ea34d] text-[#0e150e] rounded-xl text-xs font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-2">
          {voting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
          Submit Vote
        </button>
      </div>
    </div>
  );
}
