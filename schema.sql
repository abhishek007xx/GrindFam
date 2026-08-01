-- GrindFam Supabase Database Schema

-- 1. Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  leetcode_username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_friend UNIQUE (user_id, friend_id)
);

-- 3. Create Group Settings table for Dynamic Target
CREATE TABLE IF NOT EXISTS public.group_settings (
  id INT PRIMARY KEY DEFAULT 1,
  daily_target INT NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- 4. Create Daily Activity table for Platform Solved tracking
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  solved_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE (user_id, activity_date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual insert profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow individual update profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow read friends" ON public.friends FOR SELECT USING (true);
CREATE POLICY "Allow insert friends" ON public.friends FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete friends" ON public.friends FOR DELETE USING (true);

CREATE POLICY "Allow read group_settings" ON public.group_settings FOR SELECT USING (true);
CREATE POLICY "Allow update group_settings" ON public.group_settings FOR UPDATE USING (true);
CREATE POLICY "Allow insert group_settings" ON public.group_settings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read daily_activity" ON public.daily_activity FOR SELECT USING (true);
CREATE POLICY "Allow write daily_activity" ON public.daily_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update daily_activity" ON public.daily_activity FOR UPDATE USING (true);

-- Default row insert for group_settings
INSERT INTO public.group_settings (id, daily_target, updated_at)
VALUES (1, 5, NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Create Squads table
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  daily_target INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Squad Members table
CREATE TABLE IF NOT EXISTS public.squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_squad_user UNIQUE (squad_id, user_id)
);

-- Enable RLS for squads
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read squads" ON public.squads FOR SELECT USING (true);
CREATE POLICY "Allow write squads" ON public.squads FOR ALL USING (true);

CREATE POLICY "Allow read squad_members" ON public.squad_members FOR SELECT USING (true);
CREATE POLICY "Allow write squad_members" ON public.squad_members FOR ALL USING (true);

