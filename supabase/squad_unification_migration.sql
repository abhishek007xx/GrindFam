-- GrindFam Squad System Unification Migration (v3)

-- 1. Add squad_type column
ALTER TABLE squads ADD COLUMN IF NOT EXISTS squad_type TEXT NOT NULL DEFAULT 'private' CHECK (squad_type IN ('private', 'community'));

-- 2. Add invite_code column & Backfill old rows using sub-string of MD5 hash
ALTER TABLE squads ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
UPDATE squads SET invite_code = UPPER(SUBSTRING(MD5(id::text), 1, 8)) WHERE invite_code IS NULL;

-- 3. Add Discord integration columns & squad metadata
ALTER TABLE squads ADD COLUMN IF NOT EXISTS discord_category_id TEXT;
ALTER TABLE squads ADD COLUMN IF NOT EXISTS discord_invite_url TEXT;
ALTER TABLE squads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE squads ADD COLUMN IF NOT EXISTS max_members INT NOT NULL DEFAULT 10;

-- 4. Add discord_username column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_username TEXT;

-- 5. Trigger Function to Enforce Squad Member & Membership Limits
CREATE OR REPLACE FUNCTION enforce_squad_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_member_count INT;
  v_max_members INT;
  v_squad_type TEXT;
  v_user_squad_count INT;
BEGIN
  -- Fetch target squad info
  SELECT max_members, squad_type INTO v_max_members, v_squad_type FROM squads WHERE id = NEW.squad_id;

  -- Count existing members in squad
  SELECT COUNT(*) INTO v_member_count FROM squad_members WHERE squad_id = NEW.squad_id;
  IF v_member_count >= v_max_members THEN
    RAISE EXCEPTION 'Squad has reached its maximum member limit of %', v_max_members;
  END IF;

  -- Count user's active squad memberships
  SELECT COUNT(*) INTO v_user_squad_count FROM squad_members WHERE user_id = NEW.user_id;
  IF v_user_squad_count >= 4 THEN
    RAISE EXCEPTION 'Users cannot join or hold more than 4 total squad memberships';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_squad_limits ON squad_members;
CREATE TRIGGER trg_enforce_squad_limits
BEFORE INSERT ON squad_members
FOR EACH ROW EXECUTE FUNCTION enforce_squad_limits();

-- 6. Trigger to automatically set max_members to 100 for community squads
CREATE OR REPLACE FUNCTION adjust_community_squad_max_members()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.squad_type = 'community' THEN
    NEW.max_members := 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_adjust_community_squad_max_members ON squads;
CREATE TRIGGER trg_adjust_community_squad_max_members
BEFORE INSERT OR UPDATE ON squads
FOR EACH ROW EXECUTE FUNCTION adjust_community_squad_max_members();

-- 7. Ensure squad_members table structure & Primary Key
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'squad_members_pkey') THEN
    ALTER TABLE squad_members ADD CONSTRAINT squad_members_pkey PRIMARY KEY (squad_id, user_id);
  END IF;
END $$;

ALTER TABLE squad_members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'leader', 'member'));

-- 8. Enable RLS and Configure Policies
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read own squads or community discovery" ON squads;
CREATE POLICY "Members read own squads or community discovery" ON squads
  FOR SELECT USING (
    squad_type = 'community' OR
    id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users create squads" ON squads;
CREATE POLICY "Authenticated users create squads" ON squads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins update own squad settings" ON squads;
CREATE POLICY "Admins update own squad settings" ON squads
  FOR UPDATE USING (
    id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid() AND role IN ('admin', 'leader'))
  );

DROP POLICY IF EXISTS "Members read squad_members" ON squad_members;
CREATE POLICY "Members read squad_members" ON squad_members
  FOR SELECT USING (
    squad_id IN (SELECT id FROM squads WHERE squad_type = 'community') OR
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users join squads" ON squad_members;
CREATE POLICY "Users join squads" ON squad_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users leave squads or admin remove member" ON squad_members;
CREATE POLICY "Users leave squads or admin remove member" ON squad_members
  FOR DELETE USING (
    auth.uid() = user_id OR
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid() AND role IN ('admin', 'leader'))
  );

-- 9. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE squad_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE squad_members;
