-- Migration: Create Players Table
-- Date: 2026-02-01
-- This table stores individual players within a team

-- 1. Create the players table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    position VARCHAR(50),
    number INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(team_id);

-- 3. Enable RLS (Row Level Security) on the table
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- 4. Grant permissions to service_role (this is CRITICAL for backend access)
-- The service_role should have FULL access to bypass RLS
GRANT ALL ON public.players TO service_role;

-- 5. Grant permissions for authenticated users (via RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO authenticated;

-- 6. RLS Policies (for when users access directly via anon/authenticated key)
-- Service role will bypass these, but they're needed for direct client access

-- Policy: Users can read players from teams they have access to
CREATE POLICY "Allow read players for team members" ON public.players
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.teams t
            JOIN public.subscriptions s ON t.subscription_id = s.id
            WHERE t.id = players.team_id
            AND s.owner_id = auth.uid()
        )
    );

-- Policy: Users can insert players into their teams
CREATE POLICY "Allow insert players for team owners" ON public.players
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams t
            JOIN public.subscriptions s ON t.subscription_id = s.id
            WHERE t.id = players.team_id
            AND s.owner_id = auth.uid()
        )
    );

-- Policy: Users can update players in their teams
CREATE POLICY "Allow update players for team owners" ON public.players
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.teams t
            JOIN public.subscriptions s ON t.subscription_id = s.id
            WHERE t.id = players.team_id
            AND s.owner_id = auth.uid()
        )
    );

-- Policy: Users can delete players from their teams
CREATE POLICY "Allow delete players for team owners" ON public.players
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.teams t
            JOIN public.subscriptions s ON t.subscription_id = s.id
            WHERE t.id = players.team_id
            AND s.owner_id = auth.uid()
        )
    );
