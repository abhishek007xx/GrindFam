import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../supabase';

/**
 * useArenaMatchmaking — Battle Arena match state machine hook.
 * 
 * States: idle → searching → matched → in_progress → completed
 * 
 * Currently operates in demo/simulation mode with realistic timing.
 * When Supabase Realtime matchmaking is ready, the `startMatch` function
 * will switch to broadcasting a search event and listening for match responses.
 */

const MATCH_STATES = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  MATCHED: 'matched',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

const DEMO_OPPONENTS = [
  { name: 'AlgoNinja_92', elo: 1520, tier: 'Gold' },
  { name: 'CodeSprint_X', elo: 1580, tier: 'Gold' },
  { name: 'DSADemon_44', elo: 1490, tier: 'Silver' },
  { name: 'GraphMaster_7', elo: 1610, tier: 'Platinum' },
  { name: 'StackOverflow_Pro', elo: 1550, tier: 'Gold' },
];

const DEMO_PROBLEMS = [
  'Two Sum (Easy)',
  'Container With Most Water (Medium)',
  'Longest Palindromic Substring (Medium)',
  'Merge k Sorted Lists (Hard)',
  'Trapping Rain Water (Hard)',
  'Valid Parentheses (Easy)',
  'LRU Cache (Medium)',
];

export function useArenaMatchmaking(userId) {
  const [matchState, setMatchState] = useState(MATCH_STATES.IDLE);
  const [matchType, setMatchType] = useState('1v1');
  const [opponent, setOpponent] = useState(null);
  const [matchProblem, setMatchProblem] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [eloRating, setEloRating] = useState(1540);
  const [leagueTier, setLeagueTier] = useState('Gold Division');
  const [userRank, setUserRank] = useState(142);

  const searchTimeoutRef = useRef(null);
  const matchTimeoutRef = useRef(null);

  // Fetch match history from Supabase
  const fetchMatchHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('arena_matches')
        .select('*')
        .or(`player_a.eq.${userId},player_b.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setMatchHistory(data);
      }
    } catch (_) {
      // Table may not exist yet; use empty history
    }
  }, [userId]);

  useEffect(() => {
    fetchMatchHistory();
  }, [fetchMatchHistory]);

  const startMatch = useCallback((type = '1v1') => {
    setMatchType(type);
    setMatchState(MATCH_STATES.SEARCHING);
    setOpponent(null);
    setMatchProblem(null);
    setMatchResult(null);

    // Simulate matchmaking delay (1.5–2.5 seconds)
    const searchDelay = 1500 + Math.random() * 1000;
    searchTimeoutRef.current = setTimeout(() => {
      const opp = DEMO_OPPONENTS[Math.floor(Math.random() * DEMO_OPPONENTS.length)];
      const prob = DEMO_PROBLEMS[Math.floor(Math.random() * DEMO_PROBLEMS.length)];

      setOpponent(opp);
      setMatchProblem(prob);
      setMatchState(MATCH_STATES.MATCHED);

      // Auto-transition to in_progress after 1 second reveal
      matchTimeoutRef.current = setTimeout(() => {
        setMatchState(MATCH_STATES.IN_PROGRESS);
      }, 1000);
    }, searchDelay);
  }, []);

  const cancelSearch = useCallback(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    setMatchState(MATCH_STATES.IDLE);
    setOpponent(null);
    setMatchProblem(null);
  }, []);

  const completeMatch = useCallback(async (won = true) => {
    const eloChange = won ? Math.floor(20 + Math.random() * 30) : -Math.floor(10 + Math.random() * 15);

    setMatchResult({
      won,
      eloChange,
      problem: matchProblem,
      opponent: opponent?.name,
      duration: Math.floor(180 + Math.random() * 600)
    });
    setEloRating(prev => Math.max(0, prev + eloChange));
    setMatchState(MATCH_STATES.COMPLETED);

    // Persist match result to Supabase
    if (userId) {
      try {
        await supabase.from('arena_matches').insert([{
          player_a: userId,
          winner_id: won ? userId : null,
          match_type: matchType,
          problem_title: matchProblem,
          duration_seconds: Math.floor(180 + Math.random() * 600),
          elo_change_a: eloChange,
          status: 'completed'
        }]);
        fetchMatchHistory();
      } catch (_) {
        // Silently ignore if table doesn't exist yet
      }
    }
  }, [matchProblem, opponent, matchType, userId, fetchMatchHistory]);

  const resetMatch = useCallback(() => {
    setMatchState(MATCH_STATES.IDLE);
    setOpponent(null);
    setMatchProblem(null);
    setMatchResult(null);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    };
  }, []);

  return {
    matchState,
    matchType,
    setMatchType,
    opponent,
    matchProblem,
    matchResult,
    matchHistory,
    eloRating,
    leagueTier,
    userRank,
    startMatch,
    cancelSearch,
    completeMatch,
    resetMatch,
    MATCH_STATES
  };
}

export default useArenaMatchmaking;
