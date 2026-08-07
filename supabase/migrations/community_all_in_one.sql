-- ====================================================================
-- MASTER ALL-IN-ONE MIGRATION FOR GRINDFAM COMMUNITY HUB
-- Copy and paste this ENTIRE script into your Supabase SQL Editor & Run!
-- ====================================================================

-- 1. PEER CODE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_title TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Medium',
  code_snippet TEXT NOT NULL,
  language TEXT DEFAULT 'javascript',
  notes TEXT,
  kudos_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peer_reviews_squad ON public.peer_reviews (squad_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_author ON public.peer_reviews (author_id);

-- 2. LINE-ITEM ANNOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.line_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.peer_reviews(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  line_number INT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_line_annotations_review ON public.line_annotations (review_id, created_at ASC);

-- 3. USER STREAK ENGINE TABLE
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  shields_available INT DEFAULT 0,
  shields_used INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  arena_win_streak INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ARENA MATCH HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.arena_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_b UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  match_type TEXT DEFAULT '1v1' CHECK (match_type IN ('1v1', 'ghost')),
  problem_title TEXT NOT NULL,
  duration_seconds INT DEFAULT 0,
  elo_change_a INT DEFAULT 0,
  elo_change_b INT DEFAULT 0,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arena_matches_player_a ON public.arena_matches (player_a, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_arena_matches_player_b ON public.arena_matches (player_b, created_at DESC);

-- 5. SQUAD MESSAGES EMOJI REACTIONS COLUMN
ALTER TABLE public.squad_messages 
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;

-- 6. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_matches ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated users
DROP POLICY IF EXISTS "Peer reviews select" ON public.peer_reviews;
CREATE POLICY "Peer reviews select" ON public.peer_reviews FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Peer reviews insert" ON public.peer_reviews;
CREATE POLICY "Peer reviews insert" ON public.peer_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Peer reviews update" ON public.peer_reviews;
CREATE POLICY "Peer reviews update" ON public.peer_reviews FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Line annotations select" ON public.line_annotations;
CREATE POLICY "Line annotations select" ON public.line_annotations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Line annotations insert" ON public.line_annotations;
CREATE POLICY "Line annotations insert" ON public.line_annotations FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "User streaks all" ON public.user_streaks;
CREATE POLICY "User streaks all" ON public.user_streaks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Arena matches all" ON public.arena_matches;
CREATE POLICY "Arena matches all" ON public.arena_matches FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. ENABLE REALTIME BROADCAST & REPLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.peer_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.line_annotations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_streaks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_matches;
