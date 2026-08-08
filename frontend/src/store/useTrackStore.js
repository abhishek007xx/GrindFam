import { create } from 'zustand';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { API_BASE_URL } from '../config/api';

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

export const getRelaxedSlug = (str) => {
  const base = normalizeSlug(str);
  if (!base) return '';
  return base
    .replace(/\b(the|a|an|in|of|to|for|and|with|on)\b/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper to extract all possible key variations for a problem
export const getProblemKeys = (prob) => {
  if (!prob) return [];
  const keys = new Set();

  const addKeyVariants = (val) => {
    if (!val) return;
    const str = String(val);
    keys.add(str);
    const norm = normalizeSlug(str);
    if (norm) keys.add(norm);
    const relaxed = getRelaxedSlug(str);
    if (relaxed) keys.add(relaxed);
  };

  if (typeof prob === 'string' || typeof prob === 'number') {
    addKeyVariants(prob);
    return Array.from(keys);
  }

  if (prob.id) addKeyVariants(prob.id);
  if (prob.leetcode_slug) addKeyVariants(prob.leetcode_slug);
  if (prob.slug) addKeyVariants(prob.slug);
  if (prob.title_slug) addKeyVariants(prob.title_slug);
  if (prob.title) addKeyVariants(prob.title);

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
    const map = get().progressMap || {};
    const keys = getProblemKeys(prob);

    let bestStatus = 'not_started';
    let maxSolveCount = 0;
    let lastSolvedAt = null;
    let notes = '';

    for (const k of keys) {
      const rec = map[k];
      if (rec) {
        const status = rec.status || 'not_started';
        const count = rec.solve_count || (status === 'solved' ? 1 : 0);
        if (status === 'solved') {
          bestStatus = 'solved';
        } else if (status === 'revision_needed' && bestStatus === 'not_started') {
          bestStatus = 'revision_needed';
        }
        if (count > maxSolveCount) {
          maxSolveCount = count;
        }
        if (rec.solved_at && (!lastSolvedAt || new Date(rec.solved_at) > new Date(lastSolvedAt))) {
          lastSolvedAt = rec.solved_at;
        }
        if (rec.personal_notes && rec.personal_notes.trim()) {
          notes = rec.personal_notes;
        }
      }
    }

    return {
      status: bestStatus,
      solve_count: maxSolveCount,
      solved_at: lastSolvedAt,
      personal_notes: notes
    };
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

  // Fetch complete user progress from Supabase & LeetCode
  fetchUserProgress: async (userId, inputUsername = null, options = {}) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('Error loading user_progress:', error.message);
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

      // Determine LeetCode username (from input argument or Supabase profiles table)
      let lcUsername = inputUsername;
      if (!lcUsername) {
        try {
          const { data: profData } = await supabase
            .from('profiles')
            .select('leetcode_username')
            .eq('id', userId)
            .maybeSingle();
          lcUsername = profData?.leetcode_username;
        } catch (_) {}
      }

      // Trigger LeetCode AC submissions sync if username exists
      if (lcUsername && String(lcUsername).trim()) {
        get().syncLeetCodeUserProgress(userId, String(lcUsername).trim(), options);
      }
    } catch (e) {
      console.warn('Failed to fetch user progress:', e);
      set({ loading: false });
    }
  },

  // Sync recent accepted submissions from LeetCode into progressMap & Supabase with smart caching policy
  syncLeetCodeUserProgress: async (userId, leetcodeUsername, options = {}) => {
    if (!leetcodeUsername || !String(leetcodeUsername).trim()) return;
    const cleanUsername = String(leetcodeUsername).trim();
    const { force = false, minIntervalMs = 30 * 60 * 1000 } = options;

    const cacheKey = `grindfam_last_lc_sync_${userId || cleanUsername}`;
    const lastSyncTime = parseInt(localStorage.getItem(cacheKey) || '0', 10);
    const now = Date.now();

    // Skip external network calls if data was synced recently and force sync is not requested by user
    if (!force && lastSyncTime > 0 && (now - lastSyncTime) < minIntervalMs) {
      return;
    }

    let solvedSlugs = [];

    // Fetch auth token if user is logged in
    let authToken = null;
    try {
      const session = (await supabase.auth.getSession())?.data?.session;
      authToken = session?.access_token || null;
    } catch (_) {}

    // Tier 1: Vercel Native Serverless API Route (CORS-free, server-side Node.js execution)
    try {
      const url = `${API_BASE_URL}/dashboard/leetcode-solved?username=${encodeURIComponent(cleanUsername)}`;
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const vercelRes = await fetch(url, { headers });
      if (vercelRes.ok) {
        const vercelData = await vercelRes.json();
        if (vercelData?.solvedSlugs && Array.isArray(vercelData.solvedSlugs) && vercelData.solvedSlugs.length > 0) {
          solvedSlugs = vercelData.solvedSlugs;
        }
      }
    } catch (vercelErr) {
      console.warn('Vercel serverless API sync error:', vercelErr?.message);
    }

    // Tier 2: CORS Proxy fallback if direct fetch blocked by browser CORS
    if (solvedSlugs.length === 0) {
      try {
        const proxyRes = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://leetcode.com/graphql')}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            query: `
              query getUserProfile($username: String!) {
                recentAcSubmissionList(username: $username, limit: 100) {
                  title
                  titleSlug
                  timestamp
                }
              }
            `,
            variables: { username: cleanUsername }
          })
        });
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          const list = proxyData?.data?.recentAcSubmissionList || [];
          if (list.length > 0) {
            solvedSlugs = list.map(s => s.titleSlug || s.title).filter(Boolean);
          }
        }
      } catch (proxyErr) {
        console.warn('CORS proxy fetch error:', proxyErr?.message);
      }
    }

    // Tier 3: Try backend sync endpoint with session auth
    if (solvedSlugs.length === 0) {
      try {
        const session = (await supabase.auth.getSession())?.data?.session;
        const token = session?.access_token;
        if (token) {
          const response = await axios.post(`${API_BASE_URL}/dashboard/sync-leetcode-solved`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data?.solvedSlugs && Array.isArray(response.data.solvedSlugs)) {
            solvedSlugs = response.data.solvedSlugs;
          }
        }
      } catch (backendErr) {
        console.warn('Backend LeetCode sync error:', backendErr?.message);
      }
    }

    // Tier 4: Try public Alfa LeetCode API as last resort
    if (solvedSlugs.length === 0) {
      try {
        const res = await fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/acSubmission`);
        if (res.ok) {
          const data = await res.json();
          const submissionList = data?.count ? data?.submission : Array.isArray(data) ? data : [];
          solvedSlugs = submissionList.map(s => s.titleSlug || s.title).filter(Boolean);
        }
      } catch (alfaErr) {
        console.warn('Alfa LeetCode API fallback error:', alfaErr?.message);
      }
    }

    // Mark all solvedSlugs as solved in progressMap for all key variations
    if (solvedSlugs.length > 0) {
      const currentMap = get().progressMap;
      const nextMap = { ...currentMap };

      solvedSlugs.forEach(slug => {
        const keys = getProblemKeys(slug);
        const existing = get().getProblemProgress(slug);
        const record = {
          status: 'solved',
          solve_count: Math.max(1, existing.solve_count || 1),
          solved_at: existing.solved_at || new Date().toISOString(),
          personal_notes: existing.personal_notes || ''
        };
        keys.forEach(k => { nextMap[k] = record; });
      });

      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextMap)); } catch (_) {}
      try { localStorage.setItem(cacheKey, String(now)); } catch (_) {}
      set({ progressMap: nextMap });
    }
  }
}));

export default useTrackStore;
