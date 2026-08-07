-- Migration: Community V3 Migration (Roles, DM System, Realtime Publications & RLS Fixes)

-- 1. Roles column
ALTER TABLE public.squad_members ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{member}';

-- 2. DM tables
CREATE TABLE IF NOT EXISTS public.dm_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_b uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_dm_pair UNIQUE (participant_a, participant_b),
  CONSTRAINT different_participants CHECK (participant_a < participant_b)
);

CREATE TABLE IF NOT EXISTS public.dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

-- 3. RLS for DMs
ALTER TABLE public.dm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dm_threads_read" ON public.dm_threads;
DROP POLICY IF EXISTS "dm_threads_insert" ON public.dm_threads;
DROP POLICY IF EXISTS "dm_messages_read" ON public.dm_messages;
DROP POLICY IF EXISTS "dm_messages_insert" ON public.dm_messages;
DROP POLICY IF EXISTS "dm_messages_update" ON public.dm_messages;

CREATE POLICY "dm_threads_read" ON public.dm_threads FOR SELECT USING (auth.uid() = participant_a OR auth.uid() = participant_b);
CREATE POLICY "dm_threads_insert" ON public.dm_threads FOR INSERT WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);
CREATE POLICY "dm_messages_read" ON public.dm_messages FOR SELECT USING (EXISTS (SELECT 1 FROM dm_threads WHERE id = thread_id AND (auth.uid() = participant_a OR auth.uid() = participant_b)));
CREATE POLICY "dm_messages_insert" ON public.dm_messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM dm_threads WHERE id = thread_id AND (auth.uid() = participant_a OR auth.uid() = participant_b)));
CREATE POLICY "dm_messages_update" ON public.dm_messages FOR UPDATE USING (EXISTS (SELECT 1 FROM dm_threads WHERE id = thread_id AND auth.uid() IN (participant_a, participant_b)));

-- 4. Fix squad_messages RLS (THIS IS WHY CHAT IS DEAD)
DROP POLICY IF EXISTS "squad_messages_read" ON public.squad_messages;
DROP POLICY IF EXISTS "squad_messages_insert" ON public.squad_messages;

CREATE POLICY "squad_messages_read" ON public.squad_messages FOR SELECT USING (EXISTS (SELECT 1 FROM squad_members WHERE squad_id = squad_messages.squad_id AND user_id = auth.uid()));
CREATE POLICY "squad_messages_insert" ON public.squad_messages FOR INSERT WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM squad_members WHERE squad_id = squad_messages.squad_id AND user_id = auth.uid()));

-- 5. Enable realtime (wrapped so re-running won't error)
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_messages; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_members; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_threads; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_squad_messages_squad ON public.squad_messages (squad_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_messages_thread ON public.dm_messages (thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_threads_user ON public.dm_threads (participant_a, participant_b);
