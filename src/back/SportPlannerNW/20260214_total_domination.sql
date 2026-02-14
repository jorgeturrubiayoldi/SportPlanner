-- Migration: Total Domination (Marketplace + Player Access + AI)
-- Date: 2026-02-14

-- ============================================
-- 1. MARKETPLACE (Bazar)
-- ============================================
CREATE TABLE IF NOT EXISTS public.published_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    author_id UUID REFERENCES auth.users(id),
    
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    cover_image_url TEXT,
    category TEXT, -- 'Technical', 'Physical', 'Tactical'
    difficulty_level TEXT, -- 'Beginner', 'Pro', 'Elite'
    
    sales_count INT DEFAULT 0,
    rating FLOAT DEFAULT 0,
    
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    published_plan_id UUID REFERENCES public.published_plans(id),
    buyer_id UUID REFERENCES auth.users(id),
    amount_paid DECIMAL(10, 2),
    purchased_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. PLAYER ACCESS (Portal Atleta)
-- ============================================
-- Link existing players to real system users
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Unique constraint: A user can map to a player in a specific team
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_user_mapping ON public.players(team_id, user_id);

-- ============================================
-- 3. AI ANALYSIS (Cerebro)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    target_type TEXT, -- 'Player', 'Team', 'Plan'
    target_id UUID,   -- The specific ID of the target
    
    insight_type TEXT, -- 'Risk', 'Opportunity', 'Optimization'
    content TEXT,      -- The generated text advice
    confidence_score FLOAT,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.published_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Public read for published plans
CREATE POLICY "Public can view published plans" ON public.published_plans
    FOR SELECT USING (is_published = true);

-- AI Insights read policy (Team Owners only)
CREATE POLICY "Owners can view AI insights" ON public.ai_insights
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.teams t
            JOIN public.subscriptions s ON t.subscription_id = s.id
            WHERE t.id = ai_insights.team_id 
            AND s.owner_id = auth.uid()
        )
    );
