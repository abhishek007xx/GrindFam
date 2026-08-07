import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../supabase';

const MATCH_STATES = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  MATCHED: 'matched',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

const DEMO_PROBLEMS = [
  'Two Sum (Easy)',
  'Container With Most Water (Medium)',
  'Longest Palindromic Substring (Medium)',
  'Merge k Sorted Lists (Hard)',
  'Trapping Rain Water (Hard)',
  'Valid Parentheses (Easy)',
  'LRU Cache (Medium)',
];

export function useArenaMatchmaking(userId, userName = 'You') {
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
  const channelRef = useRef(null);

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

      if (!error && data) setMatchHistory(data);
    } catch (_) {}
  }, [userId]);

  useEffect(() => {
    fetchMatchHistory();
  }, [fetchMatchHistory]);

  const cleanupChannel = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  const startMatch = useCallback((type = '1v1') => {
    if (!userId) return;
    
    setMatchType(type);
    setMatchState(MATCH_STATES.SEARCHING);
    setOpponent(null);
    setMatchProblem(null);
    setMatchResult(null);
    
    cleanupChannel();

    if (type === 'ghost') {
      // Async ghost match always uses mock
      searchTimeoutRef.current = setTimeout(() => {
        setOpponent({ name: 'Ghost_Bot', elo: eloRating, tier: leagueTier });
        setMatchProblem(DEMO_PROBLEMS[Math.floor(Math.random() * DEMO_PROBLEMS.length)]);
        setMatchState(MATCH_STATES.MATCHED);
        matchTimeoutRef.current = setTimeout(() => setMatchState(MATCH_STATES.IN_PROGRESS), 1500);
      }, 1000);
      return;
    }

    // Live 1v1 uses Realtime Broadcast
    const channel = supabase.channel('arena-matchmaking', {
      config: { broadcast: { ack: true } }
    });

    channelRef.current = channel;

    channel.on('broadcast', { event: 'search' }, (payload) => {
      // Someone else is searching! Let's match with them.
      if (payload.payload.userId !== userId && matchState === MATCH_STATES.SEARCHING) {
        // Send a 'matched' event back to them
        channel.send({
          type: 'broadcast',
          event: 'matched',
          payload: { 
            opponentId: payload.payload.userId, 
            myId: userId,
            myName: userName,
            myElo: eloRating,
            problem: DEMO_PROBLEMS[Math.floor(Math.random() * DEMO_PROBLEMS.length)]
          }
        });
      }
    });

    channel.on('broadcast', { event: 'matched' }, (payload) => {
      // Someone sent us a match!
      if (payload.payload.opponentId === userId && matchState === MATCH_STATES.SEARCHING) {
        clearTimeout(searchTimeoutRef.current);
        setOpponent({ name: payload.payload.myName, elo: payload.payload.myElo, tier: 'Unknown' });
        setMatchProblem(payload.payload.problem);
        setMatchState(MATCH_STATES.MATCHED);
        
        // Let them know we accepted
        channel.send({
          type: 'broadcast',
          event: 'match_accepted',
          payload: { opponentId: payload.payload.myId, myName: userName, myElo: eloRating }
        });

        matchTimeoutRef.current = setTimeout(() => setMatchState(MATCH_STATES.IN_PROGRESS), 1500);
      }
    });

    channel.on('broadcast', { event: 'match_accepted' }, (payload) => {
      if (payload.payload.opponentId === userId && matchState === MATCH_STATES.SEARCHING) {
        clearTimeout(searchTimeoutRef.current);
        setOpponent({ name: payload.payload.myName, elo: payload.payload.myElo, tier: 'Unknown' });
        setMatchProblem(DEMO_PROBLEMS[0]); // Assume problem is passed or sync it
        setMatchState(MATCH_STATES.MATCHED);
        matchTimeoutRef.current = setTimeout(() => setMatchState(MATCH_STATES.IN_PROGRESS), 1500);
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Broadcast that we are searching
        channel.send({
          type: 'broadcast',
          event: 'search',
          payload: { userId, userName, eloRating }
        });

        // Fallback to bot if no one is found in 8 seconds
        searchTimeoutRef.current = setTimeout(() => {
          if (matchState === MATCH_STATES.SEARCHING) {
            setOpponent({ name: 'AlgoNinja_92', elo: eloRating - 10, tier: leagueTier });
            setMatchProblem(DEMO_PROBLEMS[Math.floor(Math.random() * DEMO_PROBLEMS.length)]);
            setMatchState(MATCH_STATES.MATCHED);
            matchTimeoutRef.current = setTimeout(() => setMatchState(MATCH_STATES.IN_PROGRESS), 1500);
          }
        }, 8000);
      }
    });

  }, [userId, userName, eloRating, matchState, leagueTier]);

  const cancelSearch = useCallback(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    cleanupChannel();
    setMatchState(MATCH_STATES.IDLE);
    setOpponent(null);
    setMatchProblem(null);
  }, []);

  const completeMatch = useCallback(async (won = true) => {
    const eloChange = won ? Math.floor(20 + Math.random() * 30) : -Math.floor(10 + Math.random() * 15);
    cleanupChannel();

    setMatchResult({
      won,
      eloChange,
      problem: matchProblem,
      opponent: opponent?.name,
      duration: Math.floor(180 + Math.random() * 600)
    });
    setEloRating(prev => Math.max(0, prev + eloChange));
    setMatchState(MATCH_STATES.COMPLETED);

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
      } catch (_) {}
    }
  }, [matchProblem, opponent, matchType, userId, fetchMatchHistory]);

  const resetMatch = useCallback(() => {
    setMatchState(MATCH_STATES.IDLE);
    setOpponent(null);
    setMatchProblem(null);
    setMatchResult(null);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
      cleanupChannel();
    };
  }, []);

  return {
    matchState, matchType, setMatchType,
    opponent, matchProblem, matchResult, matchHistory,
    eloRating, leagueTier, userRank,
    startMatch, cancelSearch, completeMatch, resetMatch,
    MATCH_STATES
  };
}

export default useArenaMatchmaking;
