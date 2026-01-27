-- Migration: Create Teams and TeamSeasons Tables
-- Date: 2026-01-27
-- Description: Creates tables for team management with season-specific configurations

-- ============================================
-- Table: teams (permanent team entities)
-- ============================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    
    -- Basic info
    name TEXT NOT NULL, -- Ej: "Titanes", "Águilas", "Equipo A"
    birth_year INT, -- Año de nacimiento del grupo (ej: 2015, 2016)
    description TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: team_seasons (team configuration per season)
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
    
    -- Configuration for this specific season
    category TEXT NOT NULL, -- Ej: "Alevín", "Infantil", "Cadete", "Juvenil", "Senior"
    division TEXT, -- Ej: "A", "B", "C" (optional subdivision)
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraint: Each team can only have one configuration per season
    CONSTRAINT unique_team_season UNIQUE(team_id, season_id)
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_teams_subscription ON public.teams(subscription_id);
CREATE INDEX idx_teams_birth_year ON public.teams(birth_year);
CREATE INDEX idx_team_seasons_team ON public.team_seasons(team_id);
CREATE INDEX idx_team_seasons_season ON public.team_seasons(season_id);
CREATE INDEX idx_team_seasons_category ON public.team_seasons(category);

-- ============================================
-- RLS (Row Level Security) for teams
-- ============================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can manage their teams
CREATE POLICY "Owners can manage teams" ON public.teams
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.subscriptions s 
        WHERE s.id = teams.subscription_id 
        AND s.owner_id = auth.uid()
    ));

-- Policy: Members can view teams
CREATE POLICY "Members can view teams" ON public.teams
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.subscription_members sm
        WHERE sm.subscription_id = teams.subscription_id 
        AND sm.user_id = auth.uid()
    ));

-- ============================================
-- RLS (Row Level Security) for team_seasons
-- ============================================
ALTER TABLE public.team_seasons ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can manage team_seasons
CREATE POLICY "Owners can manage team_seasons" ON public.team_seasons
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.teams t
        JOIN public.subscriptions s ON s.id = t.subscription_id
        WHERE t.id = team_seasons.team_id 
        AND s.owner_id = auth.uid()
    ));

-- Policy: Members can view team_seasons
CREATE POLICY "Members can view team_seasons" ON public.team_seasons
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.teams t
        JOIN public.subscription_members sm ON sm.subscription_id = t.subscription_id
        WHERE t.id = team_seasons.team_id 
        AND sm.user_id = auth.uid()
    ));

-- ============================================
-- Trigger: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_seasons_updated_at
    BEFORE UPDATE ON public.team_seasons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
