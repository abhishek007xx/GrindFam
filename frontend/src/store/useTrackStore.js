import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const LOCAL_STORAGE_KEY = 'grindfam_global_progress_v2';

// Helper to normalize any string into a canonical slug
export const normalizeSlug = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper to extract all possible key variations for a problem
export const getProblemKeys = (prob) => {
  if (!prob) return [];
  const keys = new Set();

  if (typeof prob === 'string' || typeof prob === 'number') {
    const str = String(prob);
    keys.add(str);
    const norm = normalizeSlug(str);
    if (norm) keys.add(norm);
    return Array.from(keys);
  }

  if (prob.id) {
    keys.add(String(prob.id));
    const norm = normalizeSlug(prob.id);
    if (norm) keys.add(norm);
  }
  if (prob.leetcode_slug) {
    keys.add(String(prob.leetcode_slug));
    const norm = normalizeSlug(prob.leetcode_slug);
    if (norm) keys.add(norm);
  }
  if (prob.slug) {
    keys.add(String(prob.slug));
    const norm = normalizeSlug(prob.slug);
    if (norm) keys.add(norm);
  }
  if (prob.title_slug) {
    keys.add(String(prob.title_slug));
    const norm = normalizeSlug(prob.title_slug);
    if (norm) keys.add(norm);
  }
  if (prob.title) {
    const norm = normalizeSlug(prob.title);
    if (norm) keys.add(norm);
  }

  return Array.from(keys);
};

// Helper to load initial progress from localStorage
const loadInitialLocalMap = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const useTrackStore = create((set, get) => ({
  progressMap: loadInitialLocalMap(),
  loading: false,
  error: null,

  // Set initial progress map
  setProgressMap: (map) => {
    const current = get().progressMap;
    const merged = { ...current };

    Object.entries(map || {}).forEach(([key, val]) => {
      const keys = getProblemKeys(key);
      const data = {
        status: val.status || 'not_started',
        solve_count: val.solve_count || (val.status === 'solved' ? 1 : 0),
        solved_at: val.solved_at || null,
        personal_notes: val.personal_notes || ''
      };
      keys.forEach(k => { merged[k] = { ...merged[k], ...data }; });
    });

    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged)); } catch (_) {}
    set({ progressMap: merged });
  },

  // Lookup progress for any problem object or ID
  getProblemProgress: (prob) => {
    if (!prob) return { status: 'not_started', solve_count: 0, solved_at: null, personal_notes: '' };
    const map = get().progressMap;
    const keys = getProblemKeys(prob);

    for (const k of keys) {
      if (map[k]) {
        return {
          status: map[k].status || 'not_started',
          solve_count: map[k].solve_count || (map[k].status === 'solved' ? 1 : 0),
          solved_at: map[k].solved_at || null,
          personal_notes: map[k].personal_notes || ''
        };
      }
    }
    return { status: 'not_started', solve_count: 0, solved_at: null, personal_notes: '' };
  },

  // Toggle problem status: not_started -> solved (1x) -> revision_needed -> not_started
  toggleStatusOptimistic: async (userId, prob) => {
    if (!prob) return;
    const keys = getProblemKeys(prob);
    if (keys.length === 0) return;

    const currentMap = get().progressMap;
    const existing = get().getProblemProgress(prob);
    const currentStatus = existing.status;

    let nextStatus = 'solved';
    let nextCount = existing.solve_count || 1;

    if (currentStatus === 'solved') {
      nextStatus = 'revision_needed';
    } else if (currentStatus === 'revision_needed') {
      nextStatus = 'not_started';
      nextCount = 0;
    } else {
      nextStatus = 'solved';
      nextCount = Math.max(1, nextCount);
    }

    const solvedAt = nextStatus === 'solved' ? new Date().toISOString() : existing.solved_at;
    const notes = existing.personal_notes || '';

    const newRecord = {
      status: nextStatus,
      solve_count: nextCount,
      solved_at: solvedAt,
      personal_notes: notes
    };

    const nextMap = { ...currentMap };
    keys.forEach(k => { nextMap[k] = newRecord; });

    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextMap)); } catch (_) {}
    set({ progressMap: nextMap });

    // Background sync to Supabase user_progress
    if (userId) {
      const primaryId = typeof prob === 'object' ? (prob.id || prob.leetcode_slug || keys[0]) : prob;
      try {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            problem_id: primaryId,
            status: nextStatus,
            solve_count: nextCount,
            solved_at: solvedAt,
            personal_notes: notes
          }, { onConflict: 'user_id,problem_id' });
      } catch (err) {
        console.warn('Supabase sync warning:', err);
      }
    }
  },

  // Increment solve/revision count for a problem (1x -> 2x -> 3x...)
  incrementSolveCount: async (userId, prob) => {
    if (!prob) return;
    const keys = getProblemKeys(prob);
    if (keys.length === 0) return;

    const currentMap = get().progressMap;
    const existing = get().getProblemProgress(prob);
    const nextCount = (existing.solve_count || 0) + 1;
    const solvedAt = new Date().toISOString();

    const newRecord = {
      status: 'solved',
      solve_count: nextCount,
      solved_at: solvedAt,
      personal_notes: existing.personal_notes || ''
    };

    const nextMap = { ...currentMap };
    keys.forEach(k => { nextMap[k] = newRecord; });

    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextMap)); } catch (_) {}
    set({ progressMap: nextMap });

    if (userId) {
      const primaryId = typeof prob === 'object' ? (prob.id || prob.leetcode_slug || keys[0]) : prob;
      try {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            problem_id: primaryId,
            status: 'solved',
            solve_count: nextCount,
            solved_at: solvedAt,
            personal_notes: existing.personal_notes || ''
          }, { onConflict: 'user_id,problem_id' });
      } catch (err) {
        console.warn('Supabase increment warning:', err);
      }
    }
  },

  // Save personal notes for a problem
  saveNotesOptimistic: async (userId, prob, notes) => {
    if (!prob) return;
    const keys = getProblemKeys(prob);
    if (keys.length === 0) return;

    const currentMap = get().progressMap;
    const existing = get().getProblemProgress(prob);

    const newRecord = {
      ...existing,
      personal_notes: notes
    };

    const nextMap = { ...currentMap };
    keys.forEach(k => { nextMap[k] = newRecord; });

    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextMap)); } catch (_) {}
    set({ progressMap: nextMap });

    if (userId) {
      const primaryId = typeof prob === 'object' ? (prob.id || prob.leetcode_slug || keys[0]) : prob;
      try {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            problem_id: primaryId,
            status: existing.status || 'not_started',
            solve_count: existing.solve_count || 0,
            solved_at: existing.solved_at || null,
            personal_notes: notes
          }, { onConflict: 'user_id,problem_id' });
      } catch (err) {
        console.warn('Save notes warning:', err);
      }
    }
  },

  // Fetch complete user progress from Supabase
  fetchUserProgress: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('Error loading user_progress:', error.message);
        set({ loading: false });
        return;
      }

      const map = {};
      (data || []).forEach(row => {
        const keys = getProblemKeys(row.problem_id);
        const record = {
          status: row.status || 'not_started',
          solve_count: row.solve_count || (row.status === 'solved' ? 1 : 0),
          solved_at: row.solved_at || null,
          personal_notes: row.personal_notes || ''
        };
        keys.forEach(k => { map[k] = record; });
      });

      const current = get().progressMap;
      const merged = { ...current, ...map };
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged)); } catch (_) {}
      set({ progressMap: merged, loading: false });
    } catch (e) {
      console.warn('Failed to fetch user progress:', e);
      set({ loading: false });
    }
  }
}));

export default useTrackStore;
