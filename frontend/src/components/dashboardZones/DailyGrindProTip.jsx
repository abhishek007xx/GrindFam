import React, { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Lightbulb, Target } from 'lucide-react';

const PRO_TIPS = [
  {
    category: 'Subarray & Window',
    title: 'Sliding Window Strategy',
    tip: 'When asked for max/min contiguous subarray or substring matching a condition, expand right pointer and shrink left pointer dynamically.',
    snippet: 'while (windowConditionFailed) { left++; }'
  },
  {
    category: 'Sorted Arrays',
    title: 'Two Pointers Pattern',
    tip: 'In sorted arrays, pointers at edges (left = 0, right = n - 1) reduce pair sum searching from O(N²) down to O(N) linear time.',
    snippet: 'if (sum > target) right--; else left++;'
  },
  {
    category: 'Cycle Detection',
    title: "Floyd's Fast & Slow Pointers",
    tip: 'Move slow pointer by 1 step and fast pointer by 2 steps. If they meet, a cycle exists — requiring 0 extra memory space.',
    snippet: 'if (slow === fast) return true; // Cycle found'
  },
  {
    category: 'Monotonic Data',
    title: 'Binary Search on Answer Space',
    tip: 'If answer bounds are clear (e.g. min capacity to ship packages), binary search the answer range instead of testing every value.',
    snippet: 'low = minCap, high = maxCap;'
  },
  {
    category: 'Next Greater Element',
    title: 'Monotonic Stack Pattern',
    tip: 'Keep elements in stack in decreasing order. When a larger element arrives, pop smaller elements — finding next greater in O(N).',
    snippet: 'while (stack.length && curr > stack.top()) pop();'
  },
  {
    category: 'Graph Traversals',
    title: 'BFS for Shortest Path',
    tip: 'Use Queue-based BFS for unweighted shortest path algorithms because BFS guarantees visiting nodes by exact distance depth.',
    snippet: 'queue.push(startNode); levelByLevel();'
  }
];

export default function DailyGrindProTip({ dailyTarget = 5, yourTodayCount = 0 }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentTip = PRO_TIPS[tipIndex];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % PRO_TIPS.length);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(`${currentTip.title}: ${currentTip.tip}\nSnippet: ${currentTip.snippet}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remaining = Math.max(0, dailyTarget - yourTodayCount);
  const progressPercent = Math.min(100, Math.round((yourTodayCount / Math.max(1, dailyTarget)) * 100));

  return (
    <div className="dash-card bg-[#1E1E1E] border border-[#333333] rounded-2xl p-4 space-y-3.5 hover:border-zinc-700 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">Daily DSA Grind Tip</h3>
            <p className="text-[10px] text-zinc-400">Pattern mastery for coding interviews</p>
          </div>
        </div>

        <button
          onClick={handleNextTip}
          className="px-2 py-1 rounded-md bg-[#262626] hover:bg-[#333333] text-zinc-300 text-[10px] font-semibold flex items-center gap-1 border border-[#333333] transition-all cursor-pointer"
          title="Cycle to next tip"
        >
          <RefreshCw className="w-3 h-3 text-[#EA5D3A]" />
          <span>Next Tip</span>
        </button>
      </div>

      {/* Tip Content Card */}
      <div className="bg-[#141414] border border-[#2C2C2C] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#EA5D3A]/15 text-[#EA5D3A] border border-[#EA5D3A]/30">
            {currentTip.category}
          </span>
          <button
            onClick={handleCopySnippet}
            className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          {currentTip.title}
        </h4>
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          {currentTip.tip}
        </p>

        <div className="bg-[#1A1A1A] px-2.5 py-1.5 rounded-lg border border-zinc-800/80 font-mono text-[10px] text-emerald-400 truncate">
          <code>{currentTip.snippet}</code>
        </div>
      </div>

      {/* Target Pace Banner */}
      <div className="pt-1 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Target className="w-3.5 h-3.5 text-[#EA5D3A]" />
          <span>{remaining === 0 ? 'Target achieved!' : `${remaining} more needed today`}</span>
        </div>
        <span className="font-mono font-bold text-[#EA5D3A]">{progressPercent}%</span>
      </div>
    </div>
  );
}
