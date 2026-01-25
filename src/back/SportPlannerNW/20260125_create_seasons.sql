-- Migration: Create Seasons Table
-- Date: 2026-01-25

CREATE TABLE IF NOT EXISTS public.seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL, -- Ej: "Temporada 2025/2026"
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_seasons_subscription ON public.seasons(subscription_id);

-- RLS (Security)
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can CRUD their seasons
CREATE POLICY "Owners can manage seasons" ON public.seasons
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.subscriptions s 
        WHERE s.id = seasons.subscription_id 
        AND s.owner_id = auth.uid()
    ));

-- Policy: Members can view seasons
CREATE POLICY "Members can view seasons" ON public.seasons
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.subscription_members sm
        WHERE sm.subscription_id = seasons.subscription_id 
        AND sm.user_id = auth.uid()
    ));
