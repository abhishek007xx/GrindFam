-- Migration: Community Upgrade, Roles, DMs, and Realtime Fix

-- 1. Add roles array column to squad_members
ALTER TABLE public.squad_members ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{member}';

-- 2. Create DM Threads table
CREATE TABLE IF NOT EXISTS public.dm_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_b UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_dm_pair UNIQUE (participant_a, participant_b)
);

-- 3. Create DM Messages table
CREATE TABLE IF NOT EXISTS public.dm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_dm_threads_a ON public.dm_threads(participant_a);
CREATE INDEX IF NOT EXISTS idx_dm_threads_b ON public.dm_threads(participant_b);
CREATE INDEX IF NOT EXISTS idx_dm_messages_thread ON public.dm_messages(thread_id);

-- 5. RLS Policies
ALTER TABLE public.dm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants view own dm_threads" ON public.dm_threads;
CREATE POLICY "Participants view own dm_threads" ON public.dm_threads
  FOR SELECT USING (auth.uid() = participant_a OR auth.uid() = participant_b);

DROP POLICY IF EXISTS "Participants create dm_threads" ON public.dm_threads;
CREATE POLICY "Participants create dm_threads" ON public.dm_threads
  FOR INSERT WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

DROP POLICY IF EXISTS "Participants view dm_messages" ON public.dm_messages;
CREATE POLICY "Participants view dm_messages" ON public.dm_messages
  FOR SELECT USING (
    thread_id IN (
      SELECT id FROM public.dm_threads WHERE participant_a = auth.uid() OR participant_b = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Senders insert dm_messages" ON public.dm_messages;
CREATE POLICY "Senders insert dm_messages" ON public.dm_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    thread_id IN (
      SELECT id FROM public.dm_threads WHERE participant_a = auth.uid() OR participant_b = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Participants update dm_messages (mark read)" ON public.dm_messages;
CREATE POLICY "Participants update dm_messages (mark read)" ON public.dm_messages
  FOR UPDATE USING (
    thread_id IN (
      SELECT id FROM public.dm_threads WHERE participant_a = auth.uid() OR participant_b = auth.uid()
    )
  );

-- 6. Safe Realtime Publication Subscription
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_messages;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_members;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_threads;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
