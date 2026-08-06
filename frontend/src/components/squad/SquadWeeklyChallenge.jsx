import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Target, Check, Vote, Loader2, Timer, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

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
  if (d === 'Easy') return 'text-emerald-400 bg-emerald-500/20';
  if (d === 'Medium') return 'text-amber-400 bg-amber-500/20';
  return 'text-red-400 bg-red-500/20';
};

export default function SquadWeeklyChallenge() {
  const { session, profile } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [weekStart, setWeekStart] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [voting, setVoting] = useState(false);

  const token = session?.access_token;

  const fetchChallenge = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/squads/weekly-challenge`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setChallenge(data.challenge);
      setWeekStart(data.weekStart || '');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchChallenge(); }, [fetchChallenge]);

  const handleVote = async () => {
    if (selectedProblems.length === 0) return;
    setVoting(true);
    try {
      await fetch(`${API_BASE}/api/squads/weekly-challenge/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ problems: selectedProblems })
      });
      fetchChallenge();
    } catch (err) { console.error(err); }
    finally { setVoting(false); }
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
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>;
  }

  const hasVoted = challenge?.votes?.[profile?.id];
  const currentProblems = challenge?.problems || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          Weekly Challenge
        </h3>
        <div className="flex items-center gap-2">
          <Timer className="w-3.5 h-3.5 text-[#8b949e]" />
          <span className="text-[10px] text-[#8b949e]">{getDaysLeft()} days left — ends {getWeekEnd()}</span>
        </div>
      </div>

      {/* Active Challenge */}
      {currentProblems.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-[#161b22] to-indigo-900/10 border border-indigo-500/20 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300">This Week's Challenge Problems</span>
          </div>
          <div className="space-y-2">
            {currentProblems.map((slug, idx) => {
              const problem = PROBLEM_SUGGESTIONS.find(p => p.slug === slug);
              return (
                <div key={slug} className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#21262d] rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-indigo-400">#{idx + 1}</span>
                    <span className="text-xs font-bold text-white">{problem?.title || slug}</span>
                    {problem && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    )}
                  </div>
                  <a href={`https://leetcode.com/problems/${slug}/`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:text-indigo-300 underline">
                    Solve →
                  </a>
                </div>
              );
            })}
          </div>
          {hasVoted && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Check className="w-4 h-4" />
              <span>You've voted for this week's challenge!</span>
            </div>
          )}
        </div>
      )}

      {/* Voting Section */}
      {!hasVoted && (
        <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8b949e]">
              Vote for 5 problems to solve together this week
            </span>
            <span className="text-[10px] text-indigo-400 font-bold">{selectedProblems.length}/5 selected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {PROBLEM_SUGGESTIONS.map(problem => {
              const isSelected = selectedProblems.includes(problem.slug);
              return (
                <button
                  key={problem.slug}
                  onClick={() => toggleProblem(problem.slug)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all text-xs ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                      : 'bg-[#0d1117] border-[#21262d] text-[#8b949e] hover:border-[#30363d]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-[#30363d]'} flex items-center justify-center`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={isSelected ? 'text-white font-bold' : ''}>{problem.title}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleVote}
            disabled={selectedProblems.length === 0 || voting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {voting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Vote className="w-4 h-4" />}
            Submit Your Vote
          </button>
        </div>
      )}
    </div>
  );
}
