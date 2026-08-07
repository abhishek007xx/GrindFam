-- community_v4_psych.sql
-- Psychological Architecture Extensions

-- 1. Add reactions column to squad_messages
ALTER TABLE public.squad_messages 
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;

-- 2. Add arena win streaks to user_streaks
ALTER TABLE public.user_streaks
ADD COLUMN IF NOT EXISTS arena_win_streak INT DEFAULT 0;

-- 3. Enhance Realtime
-- Ensure squad_messages reactions updates trigger realtime
-- (Already handled if public.squad_messages is in the publication)
