-- migration for portfolios and public sharing
CREATE TABLE IF NOT EXISTS public.portfolios (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  content JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In case it already exists but without is_public
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own portfolio" ON public.portfolios;
CREATE POLICY "Users can manage their own portfolio" ON public.portfolios 
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public portfolios are viewable by everyone" ON public.portfolios;
CREATE POLICY "Public portfolios are viewable by everyone" ON public.portfolios 
  FOR SELECT USING (is_public = true);
