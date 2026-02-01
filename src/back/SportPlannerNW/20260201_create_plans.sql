-- Migration: Create plans and plan_concepts tables
-- Date: 2026-02-01

-- ========================================
-- PLANS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_plans_subscription ON public.plans(subscription_id);
CREATE INDEX IF NOT EXISTS idx_plans_team ON public.plans(team_id);
CREATE INDEX IF NOT EXISTS idx_plans_dates ON public.plans(start_date, end_date);

-- ========================================
-- PLAN_CONCEPTS TABLE (Junction)
-- ========================================
CREATE TABLE IF NOT EXISTS public.plan_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    scheduled_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(plan_id, concept_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_plan_concepts_plan ON public.plan_concepts(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_concepts_concept ON public.plan_concepts(concept_id);

-- ========================================
-- RLS POLICIES FOR PLANS
-- ========================================
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on plans" ON public.plans
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Users can read plans from their subscription
CREATE POLICY "Users can read their subscription plans" ON public.plans
    FOR SELECT
    USING (
        subscription_id IN (
            SELECT subscription_id FROM public.subscription_members 
            WHERE user_id = auth.uid()
        )
    );

-- ========================================
-- RLS POLICIES FOR PLAN_CONCEPTS
-- ========================================
ALTER TABLE public.plan_concepts ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on plan_concepts" ON public.plan_concepts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Users can read plan_concepts from their subscription's plans
CREATE POLICY "Users can read their plan concepts" ON public.plan_concepts
    FOR SELECT
    USING (
        plan_id IN (
            SELECT p.id FROM public.plans p
            JOIN public.subscription_members sm ON p.subscription_id = sm.subscription_id
            WHERE sm.user_id = auth.uid()
        )
    );

-- Grant permissions to service role
GRANT ALL ON public.plans TO service_role;
GRANT ALL ON public.plan_concepts TO service_role;

-- Grant read permissions to authenticated users
GRANT SELECT ON public.plans TO authenticated;
GRANT SELECT ON public.plan_concepts TO authenticated;
