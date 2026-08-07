import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

/**
 * useStreakEngine — Centralized streak computation hook.
 * Replaces inline streak calculation from SquadHub.jsx.
 * 
 * Strategy:
 * 1. Try to read from `user_streaks` table (fast, pre-computed)
 * 2. Fallback: compute from `user_progress` solved dates (backward compat)
 * 3. Upsert computed result back to `user_streaks` for future reads
 */
export function useStreakEngine(userId) {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    shieldsAvailable: 0,
    isShieldActive: false,
    totalXp: 0,
    lastActiveDate: null,
    loading: true
  });

  const computeStreakFromProgress = useCallback(async (uid) => {
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('solved_at')
        .eq('user_id', uid)
        .eq('status', 'solved');

      const dates = [...new Set(
        (data || [])
          .map(p => p.solved_at ? p.solved_at.split('T')[0] : null)
          .filter(Boolean)
      )].sort();

      let currentStreak = 0;
      let longestStreak = 0;

      if (dates.length > 0) {
        currentStreak = 1;
        let tempStreak = 1;

        for (let i = dates.length - 1; i > 0; i--) {
          const curr = new Date(dates[i]);
          const prev = new Date(dates[i - 1]);
          const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
            if (i === dates.length - 1) currentStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        // Check if streak is still active (last solve was today or yesterday)
        const lastDate = new Date(dates[dates.length - 1]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);
        const daysSinceLastSolve = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

        if (daysSinceLastSolve > 1) {
          currentStreak = 0;
        }
      }

      // Shields: earn 1 shield every 7-day streak milestone
      const shieldsEarned = Math.floor(longestStreak / 7);

      return {
        currentStreak,
        longestStreak,
        shieldsAvailable: shieldsEarned,
        lastActiveDate: dates.length > 0 ? dates[dates.length - 1] : null
      };
    } catch (err) {
      console.error('useStreakEngine: Error computing streak from progress:', err);
      return { currentStreak: 0, longestStreak: 0, shieldsAvailable: 0, lastActiveDate: null };
    }
  }, []);

  const fetchStreak = useCallback(async () => {
    if (!userId) {
      setStreakData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Step 1: Try reading from user_streaks table
      const { data: streakRow, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && streakRow) {
        setStreakData({
          currentStreak: streakRow.current_streak || 0,
          longestStreak: streakRow.longest_streak || 0,
          shieldsAvailable: streakRow.shields_available || 0,
          isShieldActive: (streakRow.shields_available || 0) > 0,
          totalXp: streakRow.total_xp || 0,
          lastActiveDate: streakRow.last_active_date,
          loading: false
        });
        return;
      }

      // Step 2: Fallback — compute from user_progress dates
      const computed = await computeStreakFromProgress(userId);

      setStreakData({
        currentStreak: computed.currentStreak,
        longestStreak: computed.longestStreak,
        shieldsAvailable: computed.shieldsAvailable,
        isShieldActive: computed.shieldsAvailable > 0,
        totalXp: computed.currentStreak * 50,
        lastActiveDate: computed.lastActiveDate,
        loading: false
      });

      // Step 3: Upsert computed result to user_streaks for future fast reads
      try {
        await supabase.from('user_streaks').upsert([{
          user_id: userId,
          current_streak: computed.currentStreak,
          longest_streak: computed.longestStreak,
          shields_available: computed.shieldsAvailable,
          last_active_date: computed.lastActiveDate,
          total_xp: computed.currentStreak * 50,
          updated_at: new Date().toISOString()
        }]);
      } catch (_) {
        // Silently ignore upsert failures (table may not exist yet)
      }
    } catch (err) {
      console.error('useStreakEngine: Error:', err);
      // Final fallback: compute from progress directly
      const computed = await computeStreakFromProgress(userId);
      setStreakData({
        ...computed,
        isShieldActive: (computed.shieldsAvailable || 0) > 0,
        totalXp: (computed.currentStreak || 0) * 50,
        loading: false
      });
    }
  }, [userId, computeStreakFromProgress]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    ...streakData,
    refreshStreak: fetchStreak
  };
}

export default useStreakEngine;
