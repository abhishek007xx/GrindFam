-- Migration: Community V3 — Peer Reviews, Streak Engine, Arena Matches
-- Non-destructive: uses IF NOT EXISTS throughout

-- ═══════════════════════════════════════════════════════════════
-- 1. PEER CODE REVIEWS
-- ═══════════════════════════════════════════════════════════════
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

-- ═══════════════════════════════════════════════════════════════
-- 2. LINE-ITEM ANNOTATIONS ON REVIEWS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.line_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.peer_reviews(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  line_number INT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_line_annotations_review ON public.line_annotations (review_id, created_at ASC);

-- ═══════════════════════════════════════════════════════════════
-- 3. USER STREAK ENGINE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  shields_available INT DEFAULT 0,
  shields_used INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 4. ARENA MATCH HISTORY
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.arena_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_b UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  match_type TEXT DEFAULT '1v1' CHECK (match_type IN ('1v1', 'ghost')),
  problem_title TEXT,
  duration_seconds INT,
  elo_change_a INT DEFAULT 0,
  elo_change_b INT DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('searching', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arena_matches_player ON public.arena_matches (player_a, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

-- Peer Reviews: Squad members can read, authors can insert
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "peer_reviews_read" ON public.peer_reviews;
DROP POLICY IF EXISTS "peer_reviews_insert" ON public.peer_reviews;
DROP POLICY IF EXISTS "peer_reviews_update" ON public.peer_reviews;

CREATE POLICY "peer_reviews_read" ON public.peer_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM squad_members WHERE squad_id = peer_reviews.squad_id AND user_id = auth.uid())
  );
CREATE POLICY "peer_reviews_insert" ON public.peer_reviews
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM squad_members WHERE squad_id = peer_reviews.squad_id AND user_id = auth.uid())
  );
CREATE POLICY "peer_reviews_update" ON public.peer_reviews
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM squad_members WHERE squad_id = peer_reviews.squad_id AND user_id = auth.uid())
  );

-- Line Annotations: Squad members can read/insert via review's squad
ALTER TABLE public.line_annotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "line_annotations_read" ON public.line_annotations;
DROP POLICY IF EXISTS "line_annotations_insert" ON public.line_annotations;

CREATE POLICY "line_annotations_read" ON public.line_annotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM peer_reviews pr
      JOIN squad_members sm ON sm.squad_id = pr.squad_id
      WHERE pr.id = line_annotations.review_id AND sm.user_id = auth.uid()
    )
  );
CREATE POLICY "line_annotations_insert" ON public.line_annotations
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM peer_reviews pr
      JOIN squad_members sm ON sm.squad_id = pr.squad_id
      WHERE pr.id = line_annotations.review_id AND sm.user_id = auth.uid()
    )
  );

-- User Streaks: Users can read/manage their own streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_streaks_read" ON public.user_streaks;
DROP POLICY IF EXISTS "user_streaks_insert" ON public.user_streaks;
DROP POLICY IF EXISTS "user_streaks_update" ON public.user_streaks;

CREATE POLICY "user_streaks_read" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_streaks_insert" ON public.user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_streaks_update" ON public.user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Arena Matches: Participants can read their own matches
ALTER TABLE public.arena_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "arena_matches_read" ON public.arena_matches;
DROP POLICY IF EXISTS "arena_matches_insert" ON public.arena_matches;

CREATE POLICY "arena_matches_read" ON public.arena_matches
  FOR SELECT USING (auth.uid() = player_a OR auth.uid() = player_b);
CREATE POLICY "arena_matches_insert" ON public.arena_matches
  FOR INSERT WITH CHECK (auth.uid() = player_a);

-- ═══════════════════════════════════════════════════════════════
-- 6. REALTIME PUBLICATION
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.peer_reviews; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.line_annotations; EXCEPTION WHEN OTHERS THEN NULL; END $$;
