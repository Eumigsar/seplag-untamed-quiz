-- Mandarin Legends: Academia dos Mil Hanzi — initial schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_data JSONB DEFAULT '{}'::jsonb,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    qi INT DEFAULT 100,
    position_x FLOAT DEFAULT 400,
    position_y FLOAT DEFAULT 300,
    region_id TEXT DEFAULT 'academy_initial',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
    hanzi TEXT NOT NULL,
    mastery_level INT DEFAULT 0,
    next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_studied TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    quantity INT DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.character_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    progress JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.characters        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_quests  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own characters" ON public.characters
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own learning_progress" ON public.learning_progress
    FOR ALL USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

CREATE POLICY "Own inventory" ON public.inventory
    FOR ALL USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

CREATE POLICY "Own character_quests" ON public.character_quests
    FOR ALL USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));
