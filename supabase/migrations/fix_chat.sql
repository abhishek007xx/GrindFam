-- Migration: Fix Squad Messages RLS & Realtime Sync

DROP POLICY IF EXISTS "squad_messages_read" ON public.squad_messages;
DROP POLICY IF EXISTS "squad_messages_insert" ON public.squad_messages;

CREATE POLICY "squad_messages_read" ON public.squad_messages 
  FOR SELECT USING (EXISTS (SELECT 1 FROM squad_members WHERE squad_id = squad_messages.squad_id AND user_id = auth.uid()));

CREATE POLICY "squad_messages_insert" ON public.squad_messages 
  FOR INSERT WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM squad_members WHERE squad_id = squad_messages.squad_id AND user_id = auth.uid()));

DO $$ BEGIN 
  ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_messages; 
EXCEPTION WHEN OTHERS THEN NULL; 
END $$;

DO $$ BEGIN 
  ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_members; 
EXCEPTION WHEN OTHERS THEN NULL; 
END $$;

CREATE INDEX IF NOT EXISTS idx_squad_messages_squad ON public.squad_messages (squad_id, created_at DESC);
