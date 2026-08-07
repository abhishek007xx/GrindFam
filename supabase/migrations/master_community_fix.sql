-- ============================================================
-- MASTER COMMUNITY & SQUADS MIGRATION (Idempotent All-In-One Script)
-- Copy and paste this ENTIRE script into the Supabase SQL Editor and click "RUN"
-- ============================================================

-- 1. Profiles columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leetcode_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_track_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Squads table & columns
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  goal TEXT,
  squad_type TEXT NOT NULL DEFAULT 'private' CHECK (squad_type IN ('private', 'community')),
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE,
  max_members INT NOT NULL DEFAULT 10,
  discord_category_id TEXT,
  discord_invite_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS squad_type TEXT DEFAULT 'private';
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS invite_code TEXT;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS max_members INT DEFAULT 10;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS discord_category_id TEXT;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS discord_invite_url TEXT;

-- 3. Squad Members table & columns
CREATE TABLE IF NOT EXISTS public.squad_members (
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  roles TEXT[] DEFAULT '{member}',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (squad_id, user_id)
);

ALTER TABLE public.squad_members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE public.squad_members ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{member}';
ALTER TABLE public.squad_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Squad Messages (Realtime Chat)
CREATE TABLE IF NOT EXISTS public.squad_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Squad Code Snippets
CREATE TABLE IF NOT EXISTS public.squad_code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT DEFAULT 'javascript',
  problem_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Squad Snippet Comments
CREATE TABLE IF NOT EXISTS public.squad_snippet_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID REFERENCES public.squad_code_snippets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Squad Weekly Challenges
CREATE TABLE IF NOT EXISTS public.squad_weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  problems TEXT[] DEFAULT '{}',
  votes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_squad_week UNIQUE (squad_id, week_start)
);

-- 8. Direct Messaging Tables
CREATE TABLE IF NOT EXISTS public.dm_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_dm_pair UNIQUE (participant_a, participant_b),
  CONSTRAINT different_participants CHECK (participant_a < participant_b)
);

CREATE TABLE IF NOT EXISTS public.dm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

-- 9. Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_squad_members_user ON public.squad_members (user_id);
CREATE INDEX IF NOT EXISTS idx_squad_members_squad ON public.squad_members (squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_messages_squad ON public.squad_messages (squad_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_squad_snippets_squad ON public.squad_code_snippets (squad_id);
CREATE INDEX IF NOT EXISTS idx_squads_type ON public.squads (squad_type);
CREATE INDEX IF NOT EXISTS idx_dm_threads_user ON public.dm_threads (participant_a, participant_b);
CREATE INDEX IF NOT EXISTS idx_dm_messages_thread ON public.dm_messages (thread_id, created_at DESC);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_snippet_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

-- 11. Policies
-- Squads
DROP POLICY IF EXISTS "Members read squads" ON public.squads;
CREATE POLICY "Members read squads" ON public.squads FOR SELECT USING (
  squad_type = 'community' OR id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Auth insert squads" ON public.squads;
CREATE POLICY "Auth insert squads" ON public.squads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin update squads" ON public.squads;
CREATE POLICY "Admin update squads" ON public.squads FOR UPDATE USING (
  id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid() AND (role = 'admin' OR 'admin' = ANY(roles)))
);

-- Squad Members
DROP POLICY IF EXISTS "Members read squad_members" ON public.squad_members;
CREATE POLICY "Members read squad_members" ON public.squad_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users join squads" ON public.squad_members;
CREATE POLICY "Users join squads" ON public.squad_members FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users leave squads" ON public.squad_members;
CREATE POLICY "Users leave squads" ON public.squad_members FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins update squad_members" ON public.squad_members;
CREATE POLICY "Admins update squad_members" ON public.squad_members FOR UPDATE USING (
  squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid() AND (role = 'admin' OR 'admin' = ANY(roles))) OR user_id = auth.uid()
);

-- Squad Messages
DROP POLICY IF EXISTS "squad_messages_read" ON public.squad_messages;
DROP POLICY IF EXISTS "squad_messages_insert" ON public.squad_messages;
DROP POLICY IF EXISTS "squad_messages_delete" ON public.squad_messages;

CREATE POLICY "squad_messages_read" ON public.squad_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.squad_members WHERE squad_id = squad_messages.squad_id AND user_id = auth.uid())
);
CREATE POLICY "squad_messages_insert" ON public.squad_messages FOR INSERT WITH CHECK (
  user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.squad_members WHERE squad_id = squad_messages.squad_id AND user_id = auth.uid())
);
CREATE POLICY "squad_messages_delete" ON public.squad_messages FOR DELETE USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.squad_members WHERE squad_id = squad_messages.squad_id AND user_id = auth.uid() AND (role IN ('admin', 'moderator') OR 'admin' = ANY(roles) OR 'moderator' = ANY(roles)))
);

-- Squad Snippets & Comments
DROP POLICY IF EXISTS "squad_snippets_read" ON public.squad_code_snippets;
DROP POLICY IF EXISTS "squad_snippets_insert" ON public.squad_code_snippets;
CREATE POLICY "squad_snippets_read" ON public.squad_code_snippets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.squad_members WHERE squad_id = squad_code_snippets.squad_id AND user_id = auth.uid())
);
CREATE POLICY "squad_snippets_insert" ON public.squad_code_snippets FOR INSERT WITH CHECK (
  user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.squad_members WHERE squad_id = squad_code_snippets.squad_id AND user_id = auth.uid())
);

-- DMs
DROP POLICY IF EXISTS "dm_threads_read" ON public.dm_threads;
DROP POLICY IF EXISTS "dm_threads_insert" ON public.dm_threads;
DROP POLICY IF EXISTS "dm_messages_read" ON public.dm_messages;
DROP POLICY IF EXISTS "dm_messages_insert" ON public.dm_messages;

CREATE POLICY "dm_threads_read" ON public.dm_threads FOR SELECT USING (auth.uid() = participant_a OR auth.uid() = participant_b);
CREATE POLICY "dm_threads_insert" ON public.dm_threads FOR INSERT WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);
CREATE POLICY "dm_messages_read" ON public.dm_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.dm_threads WHERE id = thread_id AND (auth.uid() = participant_a OR auth.uid() = participant_b)));
CREATE POLICY "dm_messages_insert" ON public.dm_messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.dm_threads WHERE id = thread_id AND (auth.uid() = participant_a OR auth.uid() = participant_b)));

-- 12. Enable Realtime Publications (Safely wrapped)
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_messages; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_members; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_code_snippets; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_weekly_challenges; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_threads; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 13. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
