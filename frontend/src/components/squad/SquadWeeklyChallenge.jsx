import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Target, Check, ThumbsUp, Loader2, Timer, Sparkles } from 'lucide-react';
import { supabase } from '../../supabase';

const PROBLEM_SUGGESTIONS = [
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

const getDifficultyColor = (d) => {
  if (d === 'Easy') return 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30';
  if (d === 'Medium') return 'text-amber-400 bg-amber-500/20 border border-amber-500/30';
  return 'text-red-400 bg-red-500/20 border border-red-500/30';
};

export default function SquadWeeklyChallenge() {
  const { session, profile } = useAuth();
  const { activeSquad, challenges } = useSquadStore();
  const [loading, setLoading] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [voting, setVoting] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [weekStart, setWeekStart] = useState('');

  useEffect(() => {
    if (!activeSquad) return;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const ws = new Date(today);
    ws.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const wsStr = ws.toISOString().split('T')[0];
    setWeekStart(wsStr);

    // Use challenge from store if available
    if (challenges && challenges.length > 0) {
      setChallenge(challenges[0]);
    } else {
      // Fetch from Supabase directly
      const fetchChallenge = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('squad_weekly_challenges')
            .select('*')
            .eq('squad_id', activeSquad.id)
            .eq('week_start', wsStr)
            .maybeSingle();

          if (error) throw error;
          setChallenge(data);
        } catch (err) {
          console.error('Error fetching weekly challenge:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchChallenge();
    }
  }, [activeSquad, challenges]);

  const handleVote = async () => {
    if (selectedProblems.length === 0 || !activeSquad || !session?.user?.id) return;
    setVoting(true);
    try {
      const userId = session.user.id;

      if (challenge) {
        // Update existing challenge votes
        const existingVotes = challenge.votes || {};
        existingVotes[userId] = selectedProblems;

        // Tally all votes to determine top problems
        const allVotes = Object.values(existingVotes).flat();
        const tally = {};
        allVotes.forEach(slug => { tally[slug] = (tally[slug] || 0) + 1; });
        const topProblems = Object.entries(tally)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([slug]) => slug);

        const { error } = await supabase
          .from('squad_weekly_challenges')
          .update({
            votes: existingVotes,
            problems: topProblems
          })
          .eq('id', challenge.id);

        if (error) throw error;
        setChallenge({ ...challenge, votes: existingVotes, problems: topProblems });
      } else {
        // Create new weekly challenge
        const votes = { [userId]: selectedProblems };
        const { data, error } = await supabase
          .from('squad_weekly_challenges')
          .insert([{
            squad_id: activeSquad.id,
            week_start: weekStart,
            problems: selectedProblems,
            votes
          }])
          .select()
          .single();

        if (error) throw error;
        setChallenge(data);
      }
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setVoting(false);
    }
  };

  const toggleProblem = (slug) => {
    setSelectedProblems(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : prev.length < 5 ? [...prev, slug] : prev
    );
  };

  const getWeekEnd = () => {
    if (!weekStart) return '';
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getDaysLeft = () => {
    if (!weekStart) return 0;
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const diff = end - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>;
  }

  const hasVoted = challenge?.votes?.[profile?.id];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#161b22] border border-[#30363d] rounded-2xl">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Squad Weekly Challenge
          </h3>
          <p className="text-xs text-[#8b949e] mt-1">Vote on 5 target LeetCode problems for your squad to tackle together this week.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <Timer className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300">{getDaysLeft()} days left (ends {getWeekEnd()})</span>
        </div>
      </div>

      {/* Active Challenge Problems */}
      {challenge?.problems?.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Selected Target Problems ({challenge.problems.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {challenge.problems.map((slug) => {
              const p = PROBLEM_SUGGESTIONS.find(ps => ps.slug === slug) || { slug, title: slug, difficulty: 'Medium' };
              return (
                <div key={slug} className="p-4 bg-[#161b22] border border-[#30363d] rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{p.title}</h5>
                    <a href={`https://leetcode.com/problems/${slug}`} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 hover:underline">
                      View on LeetCode →
                    </a>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getDifficultyColor(p.difficulty)}`}>
                    {p.difficulty}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Vote Form */}
      <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-emerald-400" />
            {hasVoted ? 'Your Vote Recorded' : 'Select up to 5 Problems to Vote'}
          </h4>
          <span className="text-[10px] font-mono text-[#8b949e]">{selectedProblems.length}/5 selected</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {PROBLEM_SUGGESTIONS.map((p) => {
            const isSelected = selectedProblems.includes(p.slug);
            return (
              <button
                key={p.slug}
                onClick={() => toggleProblem(p.slug)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-[#0d1117] border-[#30363d] hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white truncate">{p.title}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </div>
                <span className={`text-[9px] font-bold inline-block mt-2 px-2 py-0.5 rounded-full ${getDifficultyColor(p.difficulty)}`}>
                  {p.difficulty}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleVote}
          disabled={selectedProblems.length === 0 || voting}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-40 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          {voting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
          Submit Vote
        </button>
      </div>
    </div>
  );
}
