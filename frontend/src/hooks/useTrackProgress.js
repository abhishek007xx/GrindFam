import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom React hook to calculate track/sheet completion progress and manage problem statuses.
 * @param {string} sourceId - The UUID of the company_track or sheet.
 * @param {'company' | 'sheet'} sourceType - The source type of the track.
 */
export function useTrackProgress(sourceId, sourceType) {
  const [problems, setProblems] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrackData = useCallback(async () => {
    if (!sourceId || !sourceType) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch problems for the specific source
      const { data: problemsData, error: problemsErr } = await supabase
        .from('problems')
        .select('*')
        .eq('source_id', sourceId)
        .eq('source_type', sourceType);

      if (problemsErr) throw problemsErr;

      setProblems(problemsData || []);

      // 2. Fetch authenticated user's progress for these problems
      const { data: { user } } = await supabase.auth.getUser();

      if (user && problemsData && problemsData.length > 0) {
        const problemIds = problemsData.map(p => p.id);
        const { data: userProgressData, error: progressErr } = await supabase
          .from('user_progress')
          .select('problem_id, status, solved_at, personal_notes')
          .eq('user_id', user.id)
          .in('problem_id', problemIds);

        if (progressErr) throw progressErr;

        const map = {};
        userProgressData?.forEach(item => {
          map[item.problem_id] = {
            status: item.status,
            solved_at: item.solved_at,
            personal_notes: item.personal_notes
          };
        });
        setProgressMap(map);
      } else {
        setProgressMap({});
      }
    } catch (err) {
      console.error('Error fetching track progress:', err);
      setError(err.message || 'Failed to load track progress.');
    } finally {
      setLoading(false);
    }
  }, [sourceId, sourceType]);

  useEffect(() => {
    fetchTrackData();
  }, [fetchTrackData]);

  // Derived progress statistics
  const totalProblems = useMemo(() => problems.length, [problems]);

  const solvedCount = useMemo(() => {
    return Object.values(progressMap).filter(p => p.status === 'solved').length;
  }, [progressMap]);

  const revisionCount = useMemo(() => {
    return Object.values(progressMap).filter(p => p.status === 'revision_needed').length;
  }, [progressMap]);

  const completionPercentage = useMemo(() => {
    if (totalProblems === 0) return 0;
    return Math.round((solvedCount / totalProblems) * 100);
  }, [totalProblems, solvedCount]);

  /**
   * Updates problem progress state in Supabase and local state.
   */
  const updateProblemProgress = async (problemId, status, personalNotes = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be logged in to update progress.');
      }

      const existing = progressMap[problemId] || {};
      const updatedNotes = personalNotes !== null ? personalNotes : (existing.personal_notes || '');
      const solvedAt = status === 'solved' ? (existing.solved_at || new Date().toISOString()) : null;

      // Optimistic state update
      setProgressMap(prev => ({
        ...prev,
        [problemId]: {
          status,
          solved_at: solvedAt,
          personal_notes: updatedNotes
        }
      }));

      const payload = {
        user_id: user.id,
        problem_id: problemId,
        status,
        solved_at: solvedAt,
        personal_notes: updatedNotes
      };

      const { error: upsertErr } = await supabase
        .from('user_progress')
        .upsert(payload, { onConflict: 'user_id,problem_id' });

      if (upsertErr) {
        // Rollback state on error
        await fetchTrackData();
        throw upsertErr;
      }
    } catch (err) {
      console.error('Failed to update problem progress:', err);
      setError(err.message);
    }
  };

  /**
   * Toggles problem status sequentially: not_started -> solved -> revision_needed -> not_started
   */
  const toggleProblemStatus = async (problemId) => {
    const currentStatus = progressMap[problemId]?.status || 'not_started';
    let nextStatus = 'solved';
    if (currentStatus === 'solved') {
      nextStatus = 'revision_needed';
    } else if (currentStatus === 'revision_needed') {
      nextStatus = 'not_started';
    }
    await updateProblemProgress(problemId, nextStatus);
  };

  return {
    loading,
    error,
    problems,
    progressMap,
    totalProblems,
    solvedCount,
    revisionCount,
    completionPercentage,
    updateProblemProgress,
    toggleProblemStatus,
    refetch: fetchTrackData
  };
}

export default useTrackProgress;
