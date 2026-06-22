-- Mandarin Academy — Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.characters (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  avatar      JSONB DEFAULT '{}',
  level       INT  DEFAULT 1,
  xp          INT  DEFAULT 0,
  qi          INT  DEFAULT 100,
  position_x  FLOAT DEFAULT 400,
  position_y  FLOAT DEFAULT 300,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_progress (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id  UUID REFERENCES public.characters(id) ON DELETE CASCADE,
  hanzi         TEXT NOT NULL,
  mastery_level INT  DEFAULT 1,
  reviewed_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.characters        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_chars" ON public.characters
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_progress" ON public.learning_progress
  FOR ALL USING (
    character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid())
  );
