import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Target, Check, ThumbsUp, Loader2, Timer, Sparkles, Hash } from 'lucide-react';
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

const diffColor = (d) => d === 'Easy' ? 'text-[#3ba55d] bg-[#3ba55d]/15' : d === 'Medium' ? 'text-[#faa61a] bg-[#faa61a]/15' : 'text-[#ed4245] bg-[#ed4245]/15';

export default function SquadWeeklyChallenge() {
  const { profile } = useAuth();
  const { activeSquad, challenges } = useSquadStore();
  const [loading, setLoading] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [voting, setVoting] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [weekStart, setWeekStart] = useState('');

  useEffect(() => {
    if (!activeSquad) return;
    const today = new Date();
    const dow = today.getDay();
    const ws = new Date(today);
    ws.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    const wsStr = ws.toISOString().split('T')[0];
    setWeekStart(wsStr);

    if (challenges?.length > 0) { setChallenge(challenges[0]); }
    else {
      setLoading(true);
      supabase.from('squad_weekly_challenges').select('*')
        .eq('squad_id', activeSquad.id).eq('week_start', wsStr).maybeSingle()
        .then(({ data }) => { setChallenge(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [activeSquad, challenges]);

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

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-[#5865f2] animate-spin" /></div>;

  const hasVoted = challenge?.votes?.[profile?.id];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-[#2f3136] rounded-lg border border-[#202225]">
        <div>
          <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#5865f2]" /> Weekly Challenge
          </h3>
          <p className="text-xs text-[#96989d] mt-0.5">Vote on 5 LeetCode problems to solve together this week.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#5865f2]/10 px-3 py-1.5 rounded text-xs font-medium text-[#5865f2]">
          <Timer className="w-4 h-4" /> {getDaysLeft()}d left (ends {getWeekEnd()})
        </div>
      </div>

      {challenge?.problems?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-[#96989d] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Selected Problems ({challenge.problems.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {challenge.problems.map(slug => {
              const p = PROBLEMS.find(x => x.slug === slug) || { slug, title: slug, difficulty: 'Medium' };
              return (
                <div key={slug} className="p-3 bg-[#2f3136] rounded-lg border border-[#202225] flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-white">{p.title}</h5>
                    <a href={`https://leetcode.com/problems/${slug}`} target="_blank" rel="noreferrer"
                      className="text-[10px] text-[#5865f2] hover:underline">View on LeetCode →</a>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${diffColor(p.difficulty)}`}>{p.difficulty}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4 bg-[#2f3136] rounded-lg border border-[#202225] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <ThumbsUp className="w-3.5 h-3.5 text-[#5865f2]" />
            {hasVoted ? 'Vote Recorded ✓' : 'Select up to 5'}
          </h4>
          <span className="text-[10px] font-mono text-[#72767d]">{selectedProblems.length}/5</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {PROBLEMS.map(p => {
            const sel = selectedProblems.includes(p.slug);
            return (
              <button key={p.slug} onClick={() => toggle(p.slug)}
                className={`p-2.5 rounded-lg border text-left transition-all ${sel ? 'border-[#5865f2] bg-[#5865f2]/10' : 'border-[#40444b] bg-[#36393f] hover:border-[#5865f2]/40'}`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-white truncate">{p.title}</span>
                  {sel && <Check className="w-3 h-3 text-[#5865f2] flex-shrink-0" />}
                </div>
                <span className={`text-[9px] font-bold inline-block mt-1 px-1.5 py-0.5 rounded ${diffColor(p.difficulty)}`}>{p.difficulty}</span>
              </button>
            );
          })}
        </div>

        <button onClick={handleVote} disabled={selectedProblems.length === 0 || voting}
          className="w-full py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm font-medium disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
          {voting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
          Submit Vote
        </button>
      </div>
    </div>
  );
}
