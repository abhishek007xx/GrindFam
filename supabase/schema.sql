-- DSA Tracker Supabase SQL Migration Script

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  leetcode_username TEXT,
  target_track_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was previously created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leetcode_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_track_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT
);

-- 3. Company Tracks Table
CREATE TABLE IF NOT EXISTS public.company_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  level TEXT NOT NULL,
  guidelines JSONB DEFAULT '{}'::jsonb,
  roadmap JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT unique_company_role_level UNIQUE (company_id, role, level)
);

-- 4. Sheets Table
CREATE TABLE IF NOT EXISTS public.sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  total_problems INT DEFAULT 0
);

-- 5. Problems Table
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leetcode_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  topic_tags TEXT[] DEFAULT '{}'::text[],
  source_type TEXT NOT NULL CHECK (source_type IN ('company', 'sheet')),
  source_id UUID NOT NULL,
  frequency_score INT DEFAULT 5,
  youtube_tutorial_url TEXT,
  step_name TEXT,
  CONSTRAINT unique_source_leetcode_slug UNIQUE (source_type, source_id, leetcode_slug)
);

-- 6. User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'solved', 'revision_needed')),
  solved_at TIMESTAMPTZ,
  personal_notes TEXT,
  PRIMARY KEY (user_id, problem_id)
);

-- Indexes for performant queries
CREATE INDEX IF NOT EXISTS idx_problems_source ON public.problems (source_id, source_type);
CREATE INDEX IF NOT EXISTS idx_problems_leetcode_slug ON public.problems (leetcode_slug);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress (user_id);

-- Enable Row Level Security (RLS) on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed to avoid conflict on re-runs
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

-- Public & Authenticated Read Policies
CREATE POLICY "Allow read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow read company_tracks" ON public.company_tracks FOR SELECT USING (true);
CREATE POLICY "Allow read sheets" ON public.sheets FOR SELECT USING (true);
CREATE POLICY "Allow read problems" ON public.problems FOR SELECT USING (true);

-- User-level strict Write Policies
CREATE POLICY "Allow user insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow user update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user read own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow user insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow user delete own progress" ON public.user_progress FOR DELETE USING (auth.uid() = user_id);
