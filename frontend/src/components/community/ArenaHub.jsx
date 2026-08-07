import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Zap, Shield, Clock, Play, UserCheck, X, CheckCircle2, XCircle } from 'lucide-react';

export function ArenaHub({
  matchState = 'idle',
  matchType = '1v1',
  setMatchType,
  opponent = null,
  matchProblem = null,
  matchResult = null,
  matchHistory = [],
  eloRating = 1540,
  leagueTier = 'Gold Division',
  userRank = 142,
  onStartMatch,
  onCancelSearch,
  onCompleteMatch,
  onResetMatch,
  MATCH_STATES = {}
}) {

  return (
    <div
      role="tabpanel"
      id="arena-panel"
      aria-labelledby="tab-arena"
      className="space-y-6 animate-fadeIn"
    >
      {/* ── 1. Daily Speed Puzzle Banner ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-gradient-to-r from-[#161B22] via-[#1F2937] to-[#161B22] border border-[#30363D] rounded-xl p-6 shadow-2xl relative overflow-hidden space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#21262D] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-[11px] font-bold uppercase">
                Daily Speed Puzzle
              </span>
              <span className="text-xs text-[#9CA3AF] font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" /> Resets in 4h 12m
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#F3F4F6]">
              Minimum Window Substring Speed Run
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-extrabold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
          >
            <Zap className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Play Daily Speed Run (+100 XP)</span>
          </motion.button>
        </div>

        <p className="text-xs text-[#9CA3AF]">
          Solve today's featured puzzle in under 5 minutes to climb the weekly speed leaderboard.
        </p>
      </motion.section>

      {/* ── 2. Instant Battle Match Launcher Card ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-live="polite"
        aria-atomic="true"
        className="bg-[#1F2937] border-2 border-[#EA5D3A] rounded-2xl p-6 md:p-8 text-center shadow-[0_0_30px_rgba(234,93,58,0.15)] relative space-y-6"
      >
        {/* Match State: IDLE */}
        {matchState === 'idle' && (
          <>
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] flex items-center justify-center mx-auto shadow-md">
                <Swords className="w-6 h-6" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
                Arena Battle League
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Head-to-head speed coding against developers of equal skill. 0 ELO loss on your first defeat today!
              </p>
            </div>

            {/* Match Type Selector Tabs */}
            <div className="flex justify-center gap-2 max-w-xs mx-auto" role="tablist" aria-label="Match Mode Selection">
              <button
                role="tab"
                aria-selected={matchType === '1v1'}
                onClick={() => setMatchType?.('1v1')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A] ${
                  matchType === '1v1'
                    ? 'bg-[#EA5D3A] text-white border-[#EA5D3A] shadow-md'
                    : 'bg-[#161B22] text-[#9CA3AF] border-[#30363D] hover:text-white'
                }`}
              >
                Live 1v1 Match
              </button>
              <button
                role="tab"
                aria-selected={matchType === 'ghost'}
                onClick={() => setMatchType?.('ghost')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A] ${
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartMatch?.(matchType)}
                aria-live="polite"
                className="w-full py-4 bg-[#EA5D3A] hover:bg-[#F2633F] text-white text-sm font-extrabold rounded-xl shadow-xl shadow-[#EA5D3A]/30 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Launch {matchType === '1v1' ? 'Live 1v1 Match' : 'Ghost Duel'} Now</span>
              </motion.button>
            </div>
          </>
        )}

        {/* Match State: SEARCHING */}
        {matchState === 'searching' && (
          <div className="max-w-md mx-auto space-y-4 py-4">
            <div className="w-16 h-16 rounded-full border-4 border-[#EA5D3A] border-t-transparent animate-spin mx-auto" />
            <h3 className="text-lg font-extrabold text-[#F3F4F6]">Finding Opponent...</h3>
            <p className="text-xs text-[#9CA3AF]">Matching you with an equal-ELO opponent (under 3 seconds)</p>
            <button
              onClick={onCancelSearch}
              className="px-4 py-2 bg-[#161B22] border border-[#30363D] text-[#9CA3AF] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 mx-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Search</span>
            </button>
          </div>
        )}

        {/* Match State: MATCHED */}
        {matchState === 'matched' && opponent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto space-y-4 py-4"
          >
            <h3 className="text-lg font-extrabold text-[#10B981]">Match Found!</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[#EA5D3A]/20 border border-[#EA5D3A]/40 flex items-center justify-center text-[#EA5D3A] font-bold mx-auto">You</div>
                <span className="text-xs text-[#9CA3AF] mt-1 block">{eloRating} ELO</span>
              </div>
              <Swords className="w-6 h-6 text-[#F59E0B] animate-pulse" />
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[#6B7280]/20 border border-[#6B7280]/40 flex items-center justify-center text-[#F3F4F6] font-bold text-xs mx-auto">
                  {opponent.name?.[0] || 'O'}
                </div>
                <span className="text-xs text-[#9CA3AF] mt-1 block">{opponent.elo} ELO</span>
              </div>
            </div>
            <p className="text-xs text-[#F3F4F6] font-semibold">Problem: {matchProblem}</p>
          </motion.div>
        )}

        {/* Match State: IN_PROGRESS */}
        {matchState === 'in_progress' && (
          <div className="max-w-md mx-auto space-y-4 py-4">
            <h3 className="text-lg font-extrabold text-[#F59E0B]">Battle In Progress</h3>
            <p className="text-sm text-[#F3F4F6]">{matchProblem}</p>
            <p className="text-xs text-[#9CA3AF]">vs {opponent?.name} ({opponent?.elo} ELO)</p>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onCompleteMatch?.(true)}
                className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Won</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onCompleteMatch?.(false)}
                className="px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>I Lost</span>
              </motion.button>
            </div>
          </div>
        )}

        {/* Match State: COMPLETED */}
        {matchState === 'completed' && matchResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto space-y-4 py-4"
          >
            <h3 className={`text-2xl font-extrabold ${matchResult.won ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {matchResult.won ? '🎉 Victory!' : 'Defeat'}
            </h3>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-[#9CA3AF]">vs {matchResult.opponent}</span>
              <span className={`font-mono font-extrabold ${matchResult.eloChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {matchResult.eloChange >= 0 ? '+' : ''}{matchResult.eloChange} ELO
              </span>
            </div>
            <button
              onClick={onResetMatch}
              className="px-5 py-2.5 bg-[#EA5D3A] hover:bg-[#F2633F] text-white rounded-xl text-xs font-bold mx-auto flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Again</span>
            </button>
          </motion.div>
        )}

        {/* ELO & Division Counter Row (always visible) */}
        <div className="pt-4 border-t border-[#30363D] flex items-center justify-around max-w-md mx-auto text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
            <span className="text-[#9CA3AF]">ELO Rating:</span>
            <span className="font-mono font-extrabold text-[#F3F4F6] text-sm">{eloRating}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#EA5D3A]" aria-hidden="true" />
            <span className="text-[#9CA3AF]">Tier:</span>
            <span className="font-bold text-[#EA5D3A]">{leagueTier}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#10B981]" aria-hidden="true" />
            <span className="text-[#9CA3AF]">Rank:</span>
            <span className="font-mono font-bold text-[#10B981]">#{userRank}</span>
          </div>
        </div>
      </motion.section>

      {/* ── 3. Recent Match History ── */}
      {matchHistory.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-3"
        >
          <h3 className="text-sm font-bold text-[#F3F4F6] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
            <span>Recent Match History</span>
          </h3>
          <div className="space-y-2">
            {matchHistory.slice(0, 5).map((match, idx) => {
              const won = match.winner_id === match.player_a;
              return (
                <div key={match.id || idx} className="flex items-center justify-between py-2 px-3 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      won ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                    }`}>
                      {won ? 'WIN' : 'LOSS'}
                    </span>
                    <span className="text-[#F3F4F6] font-medium">{match.problem_title || 'Arena Match'}</span>
                  </div>
                  <span className={`font-mono font-bold ${
                    match.elo_change_a >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}>
                    {match.elo_change_a >= 0 ? '+' : ''}{match.elo_change_a} ELO
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}
    </div>
  );
}

export default ArenaHub;
