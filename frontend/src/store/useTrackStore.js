import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export const useTrackStore = create((set, get) => ({
  progressMap: {}, // { [problem_id]: { status: 'not_started' | 'solved' | 'revision_needed', personal_notes: string, solved_at: string } }
  loading: false,
  error: null,

  // Set initial progress map from Supabase fetch
  setProgressMap: (map) => set({ progressMap: map }),

  // Optimistic UI status toggle & background sync to Supabase
  toggleStatusOptimistic: async (userId, problemId) => {
    if (!problemId) return;

    const currentMap = get().progressMap;
    const existing = currentMap[problemId] || {};
    const currentStatus = existing.status || 'not_started';

    let nextStatus = 'solved';
    if (currentStatus === 'solved') {
      nextStatus = 'revision_needed';
    } else if (currentStatus === 'revision_needed') {
      nextStatus = 'not_started';
    }

    const solvedAt = nextStatus === 'solved' ? (existing.solved_at || new Date().toISOString()) : null;
    const personalNotes = existing.personal_notes || '';

    // 1. Instant optimistic state update
    set({
      progressMap: {
        ...currentMap,
        [problemId]: {
          status: nextStatus,
          solved_at: solvedAt,
          personal_notes: personalNotes
        }
      }
    });

    // 2. Background sync to Supabase
    if (userId) {
      try {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            problem_id: problemId,
            status: nextStatus,
            solved_at: solvedAt,
            personal_notes: personalNotes
          }, { onConflict: 'user_id,problem_id' });

        if (error) {
          console.error('Supabase sync error:', error);
          // Rollback on error
          set({ progressMap: currentMap });
        }
      } catch (err) {
        console.error('Background sync failed:', err);
        set({ progressMap: currentMap });
      }
    }
  },

  // Save personal notes for a problem
  saveNotesOptimistic: async (userId, problemId, notes) => {
    if (!problemId) return;

    const currentMap = get().progressMap;
    const existing = currentMap[problemId] || {};

    set({
      progressMap: {
        ...currentMap,
        [problemId]: {
          ...existing,
          personal_notes: notes
        }
      }
    });

    if (userId) {
      try {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            problem_id: problemId,
            status: existing.status || 'not_started',
            solved_at: existing.solved_at || null,
            personal_notes: notes
          }, { onConflict: 'user_id,problem_id' });

        if (error) console.error('Failed to save notes to Supabase:', error);
      } catch (err) {
        console.error('Error saving notes:', err);
      }
    }
  }
}));

export default useTrackStore;
