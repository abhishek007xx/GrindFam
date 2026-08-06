-- ============================================================
-- GrindFam Squads Community System v2 — Supabase SQL Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. ALTER existing squads table to add new columns
ALTER TABLE squads ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;
ALTER TABLE squads ADD COLUMN IF NOT EXISTS goal TEXT DEFAULT NULL;
ALTER TABLE squads ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 10;

-- 2. ALTER existing squad_members table
ALTER TABLE squad_members ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT FALSE;
ALTER TABLE squad_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE squad_members ADD COLUMN IF NOT EXISTS weekly_solved INTEGER DEFAULT 0;

-- 3. Squad Messages (Real-time Chat)
CREATE TABLE IF NOT EXISTS squad_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'code', 'standup', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_squad_messages_squad_id ON squad_messages(squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_messages_created_at ON squad_messages(created_at DESC);

-- 4. Squad Code Snippets (Solution Sharing)
CREATE TABLE IF NOT EXISTS squad_code_snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT DEFAULT 'javascript',
  problem_slug TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_squad_snippets_squad_id ON squad_code_snippets(squad_id);

-- 5. Snippet Comments (Peer Review)
CREATE TABLE IF NOT EXISTS squad_snippet_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snippet_id UUID NOT NULL REFERENCES squad_code_snippets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Weekly Challenges
CREATE TABLE IF NOT EXISTS squad_weekly_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  week_start DATE NOT NULL DEFAULT CURRENT_DATE,
  problems JSONB DEFAULT '[]'::jsonb,
  votes JSONB DEFAULT '{}'::jsonb,
  completed_by JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'voting', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, week_start)
);

-- 7. Reports (Anti-toxicity)
CREATE TABLE IF NOT EXISTS squad_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Realtime on squad_messages for instant chat
ALTER PUBLICATION supabase_realtime ADD TABLE squad_messages;

-- 9. Row Level Security (RLS) policies
ALTER TABLE squad_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_snippet_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read messages from their squad
CREATE POLICY "Users can read their squad messages" ON squad_messages
  FOR SELECT USING (
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Allow authenticated users to insert messages in their squad
CREATE POLICY "Users can send messages to their squad" ON squad_messages
  FOR INSERT WITH CHECK (
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Allow reading snippets from own squad
CREATE POLICY "Users can read their squad snippets" ON squad_code_snippets
  FOR SELECT USING (
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Allow inserting snippets to own squad
CREATE POLICY "Users can share snippets in their squad" ON squad_code_snippets
  FOR INSERT WITH CHECK (
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Allow reading comments
CREATE POLICY "Users can read snippet comments" ON squad_snippet_comments
  FOR SELECT USING (
    snippet_id IN (
      SELECT id FROM squad_code_snippets WHERE squad_id IN (
        SELECT squad_id FROM squad_members WHERE user_id = auth.uid()
      )
    )
  );

-- Allow inserting comments
CREATE POLICY "Users can comment on snippets" ON squad_snippet_comments
  FOR INSERT WITH CHECK (
    snippet_id IN (
      SELECT id FROM squad_code_snippets WHERE squad_id IN (
        SELECT squad_id FROM squad_members WHERE user_id = auth.uid()
      )
    )
  );

-- Allow reading weekly challenges
CREATE POLICY "Users can read their squad challenges" ON squad_weekly_challenges
  FOR SELECT USING (
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Allow all on challenges for squad members
CREATE POLICY "Users can manage their squad challenges" ON squad_weekly_challenges
  FOR ALL USING (
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Allow inserting reports
CREATE POLICY "Users can submit reports" ON squad_reports
  FOR INSERT WITH CHECK (
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Done!
-- After running this, go to Supabase Dashboard → Database → Replication
-- and ensure "squad_messages" table has Realtime enabled.
