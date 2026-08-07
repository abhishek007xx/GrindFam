-- DSA Tracker Supabase SQL Migration Script (Concise Version < 80 lines)

-- 1. Tables Creation & Alterations
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT, leetcode_username TEXT, target_track_id UUID, created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leetcode_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_track_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, logo_url TEXT
);

CREATE TABLE IF NOT EXISTS public.company_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL, level TEXT NOT NULL,
  guidelines JSONB DEFAULT '{}'::jsonb, roadmap JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT unique_company_role_level UNIQUE (company_id, role, level)
);

CREATE TABLE IF NOT EXISTS public.sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, creator TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, total_problems INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leetcode_slug TEXT NOT NULL, title TEXT NOT NULL, difficulty TEXT NOT NULL,
  topic_tags TEXT[] DEFAULT '{}'::text[],
  source_type TEXT NOT NULL CHECK (source_type IN ('company', 'sheet')),
  source_id UUID NOT NULL, frequency_score INT DEFAULT 5, youtube_tutorial_url TEXT, step_name TEXT,
  CONSTRAINT unique_source_leetcode_slug UNIQUE (source_type, source_id, leetcode_slug)
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'solved', 'revision_needed')),
  solved_at TIMESTAMPTZ, personal_notes TEXT, PRIMARY KEY (user_id, problem_id)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_problems_source ON public.problems (source_id, source_type);
CREATE INDEX IF NOT EXISTS idx_problems_leetcode_slug ON public.problems (leetcode_slug);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress (user_id);

-- 3. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 4. Policies Setup
DROP POLICY IF EXISTS "Allow read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow user update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow read companies" ON public.companies;
DROP POLICY IF EXISTS "Allow read company_tracks" ON public.company_tracks;
DROP POLICY IF EXISTS "Allow read sheets" ON public.sheets;
DROP POLICY IF EXISTS "Allow read problems" ON public.problems;
DROP POLICY IF EXISTS "Allow user read own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow user insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow user update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow user delete own progress" ON public.user_progress;

CREATE POLICY "Allow read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow read company_tracks" ON public.company_tracks FOR SELECT USING (true);
CREATE POLICY "Allow read sheets" ON public.sheets FOR SELECT USING (true);
CREATE POLICY "Allow read problems" ON public.problems FOR SELECT USING (true);

CREATE POLICY "Allow user insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow user update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow user read own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow user insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow user delete own progress" ON public.user_progress FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SQUAD SYSTEM TABLES
-- ============================================================

-- Squads table (unified: private & community)
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

-- Squad members junction table
CREATE TABLE IF NOT EXISTS public.squad_members (
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (squad_id, user_id)
);

-- Squad messages (realtime chat)
CREATE TABLE IF NOT EXISTS public.squad_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Squad code snippets (peer review)
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

-- Squad code snippet comments
CREATE TABLE IF NOT EXISTS public.squad_snippet_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID REFERENCES public.squad_code_snippets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Squad weekly challenges
CREATE TABLE IF NOT EXISTS public.squad_weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  problems TEXT[] DEFAULT '{}',
  votes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_squad_week UNIQUE (squad_id, week_start)
);

-- Add discord_username column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_username TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_squad_members_user ON public.squad_members (user_id);
CREATE INDEX IF NOT EXISTS idx_squad_members_squad ON public.squad_members (squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_messages_squad ON public.squad_messages (squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_snippets_squad ON public.squad_code_snippets (squad_id);
CREATE INDEX IF NOT EXISTS idx_squads_type ON public.squads (squad_type);
CREATE INDEX IF NOT EXISTS idx_squads_invite_code ON public.squads (invite_code);

-- RLS for squad tables
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_snippet_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_weekly_challenges ENABLE ROW LEVEL SECURITY;

-- Squads policies
DROP POLICY IF EXISTS "Members read own squads or community discovery" ON public.squads;
CREATE POLICY "Members read own squads or community discovery" ON public.squads
  FOR SELECT USING (
    squad_type = 'community' OR
    id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users create squads" ON public.squads;
CREATE POLICY "Authenticated users create squads" ON public.squads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins update own squad settings" ON public.squads;
CREATE POLICY "Admins update own squad settings" ON public.squads
  FOR UPDATE USING (
    id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Squad members policies
DROP POLICY IF EXISTS "Members read squad_members" ON public.squad_members;
CREATE POLICY "Members read squad_members" ON public.squad_members
  FOR SELECT USING (
    squad_id IN (SELECT id FROM public.squads WHERE squad_type = 'community') OR
    squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users join squads" ON public.squad_members;
CREATE POLICY "Users join squads" ON public.squad_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users leave squads" ON public.squad_members;
CREATE POLICY "Users leave squads" ON public.squad_members
  FOR DELETE USING (auth.uid() = user_id);

-- Squad messages policies
DROP POLICY IF EXISTS "Members read squad messages" ON public.squad_messages;
CREATE POLICY "Members read squad messages" ON public.squad_messages
  FOR SELECT USING (
    squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Members send squad messages" ON public.squad_messages;
CREATE POLICY "Members send squad messages" ON public.squad_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid())
  );

-- Squad code snippets policies
DROP POLICY IF EXISTS "Members read squad snippets" ON public.squad_code_snippets;
CREATE POLICY "Members read squad snippets" ON public.squad_code_snippets
  FOR SELECT USING (
    squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Members share squad snippets" ON public.squad_code_snippets;
CREATE POLICY "Members share squad snippets" ON public.squad_code_snippets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid())
  );

-- Snippet comments policies
DROP POLICY IF EXISTS "Members read snippet comments" ON public.squad_snippet_comments;
CREATE POLICY "Members read snippet comments" ON public.squad_snippet_comments
  FOR SELECT USING (
    snippet_id IN (
      SELECT id FROM public.squad_code_snippets WHERE squad_id IN (
        SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Members post snippet comments" ON public.squad_snippet_comments;
CREATE POLICY "Members post snippet comments" ON public.squad_snippet_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    snippet_id IN (
      SELECT id FROM public.squad_code_snippets WHERE squad_id IN (
        SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid()
      )
    )
  );

-- Weekly challenges policies
DROP POLICY IF EXISTS "Members read weekly challenges" ON public.squad_weekly_challenges;
CREATE POLICY "Members read weekly challenges" ON public.squad_weekly_challenges
  FOR SELECT USING (
    squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Members manage weekly challenges" ON public.squad_weekly_challenges;
CREATE POLICY "Members manage weekly challenges" ON public.squad_weekly_challenges
  FOR ALL USING (
    squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid())
  );

-- Trigger: enforce squad member limits (10 private, 100 community) and max 4 squads per user
CREATE OR REPLACE FUNCTION public.enforce_squad_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_member_count INT;
  v_max_members INT;
  v_user_squad_count INT;
BEGIN
  SELECT max_members INTO v_max_members FROM public.squads WHERE id = NEW.squad_id;
  SELECT COUNT(*) INTO v_member_count FROM public.squad_members WHERE squad_id = NEW.squad_id;
  IF v_member_count >= v_max_members THEN
    RAISE EXCEPTION 'Squad has reached its maximum member limit of %', v_max_members;
  END IF;
  SELECT COUNT(*) INTO v_user_squad_count FROM public.squad_members WHERE user_id = NEW.user_id;
  IF v_user_squad_count >= 4 THEN
    RAISE EXCEPTION 'You cannot join more than 4 squads';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_squad_limits ON public.squad_members;
CREATE TRIGGER trg_enforce_squad_limits
BEFORE INSERT ON public.squad_members
FOR EACH ROW EXECUTE FUNCTION public.enforce_squad_limits();

-- Trigger: auto-set max_members=100 for community squads
CREATE OR REPLACE FUNCTION public.adjust_community_squad_max_members()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.squad_type = 'community' THEN
    NEW.max_members := 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_adjust_community_squad_max_members ON public.squads;
CREATE TRIGGER trg_adjust_community_squad_max_members
BEFORE INSERT OR UPDATE ON public.squads
FOR EACH ROW EXECUTE FUNCTION public.adjust_community_squad_max_members();

-- Enable Realtime on squad tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_members;
