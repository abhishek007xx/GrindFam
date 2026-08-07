import React, { useState } from 'react';
import { Swords, Trophy, Zap, Shield, Clock, Play, UserCheck } from 'lucide-react';

export function ArenaHub({ eloRating = 1540, leagueTier = 'Gold Division', userRank = 142 }) {
  const [matchType, setMatchType] = useState('1v1'); // '1v1' or 'ghost'
  const [isSearching, setIsSearching] = useState(false);

  const handleStartMatch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      alert(`Match Found! Launching ${matchType === '1v1' ? 'Live 1v1 Battle' : 'Async Ghost Time-Trial'}...`);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── 1. Daily Speed Puzzle Banner ── */}
      <section className="bg-gradient-to-r from-[#161B22] via-[#1F2937] to-[#161B22] border border-[#30363D] rounded-xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#21262D] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-[11px] font-bold uppercase">
                Daily Speed Puzzle
              </span>
              <span className="text-xs text-[#9CA3AF] font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" /> Resets in 4h 12m
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#F3F4F6]">
              Minimum Window Substring Speed Run
            </h2>
          </div>

          <button className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-extrabold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 flex-shrink-0">
            <Zap className="w-4 h-4 fill-current" />
            <span>Play Daily Speed Run (+100 XP)</span>
          </button>
        </div>

        <p className="text-xs text-[#9CA3AF]">
          Solve today's featured puzzle in under 5 minutes to climb the weekly speed leaderboard.
        </p>
      </section>

      {/* ── 2. Instant Battle Match Launcher Card ── */}
      <section className="bg-[#1F2937] border-2 border-[#EA5D3A] rounded-2xl p-6 md:p-8 text-center shadow-[0_0_30px_rgba(234,93,58,0.15)] relative space-y-6">
        <div className="max-w-md mx-auto space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] flex items-center justify-center mx-auto shadow-md">
            <Swords className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
            Arena Battle League
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Head-to-head speed coding against developers of equal skill. 0 ELO loss on your first defeat today!
          </p>
        </div>

        {/* Match Type Selector */}
        <div className="flex justify-center gap-2 max-w-xs mx-auto">
          <button
            onClick={() => setMatchType('1v1')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
              matchType === '1v1'
                ? 'bg-[#EA5D3A] text-white border-[#EA5D3A] shadow-md'
                : 'bg-[#161B22] text-[#9CA3AF] border-[#30363D] hover:text-white'
            }`}
          >
            Live 1v1 Match
          </button>
          <button
            onClick={() => setMatchType('ghost')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
              matchType === 'ghost'
                ? 'bg-[#EA5D3A] text-white border-[#EA5D3A] shadow-md'
                : 'bg-[#161B22] text-[#9CA3AF] border-[#30363D] hover:text-white'
            }`}
          >
            Async Ghost Run
          </button>
        </div>

        {/* Big Match Launch Button */}
        <div className="max-w-md mx-auto">
          <button
            onClick={handleStartMatch}
            disabled={isSearching}
            className="w-full py-4 bg-[#EA5D3A] hover:bg-[#F2633F] text-white text-sm font-extrabold rounded-xl shadow-xl shadow-[#EA5D3A]/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Finding Opponent (&lt; 3s)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Launch {matchType === '1v1' ? 'Live 1v1 Match' : 'Ghost Duel'} Now</span>
              </>
            )}
          </button>
        </div>

        {/* ELO & Division Counter Row */}
        <div className="pt-4 border-t border-[#30363D] flex items-center justify-around max-w-md mx-auto text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[#9CA3AF]">ELO Rating:</span>
            <span className="font-mono font-extrabold text-[#F3F4F6] text-sm">{eloRating}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#EA5D3A]" />
            <span className="text-[#9CA3AF]">Tier:</span>
            <span className="font-bold text-[#EA5D3A]">{leagueTier}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#10B981]" />
            <span className="text-[#9CA3AF]">Rank:</span>
            <span className="font-mono font-bold text-[#10B981]">#{userRank}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ArenaHub;
