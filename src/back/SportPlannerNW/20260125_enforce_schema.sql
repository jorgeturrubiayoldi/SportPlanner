-- Migration: Enforce Single Active Subscription & Add Members Table
-- Date: 2026-01-25

-- 1. Enforce strict 1 User = 1 Active Subscription rule
-- This prevents a user from being the 'owner_id' of more than one row where status is 'active'.
CREATE UNIQUE INDEX idx_unique_active_owner 
ON public.subscriptions (owner_id) 
WHERE status = 'active';

-- 2. Create Members table (separates "Paying Owner" from "Team Players")
CREATE TABLE public.subscription_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    
    -- Optional: Link to a system user if they have an account
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Mandatory: Display name (e.g., "Player 1" or the user's name)
    display_name TEXT NOT NULL,
    
    -- Role within the subscription (e.g., 'admin', 'coach', 'player')
    role TEXT NOT NULL DEFAULT 'player',
    
    joined_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraint: A system user can only be in the same subscription once
    CONSTRAINT uk_subscription_user UNIQUE (subscription_id, user_id)
);

-- Enable RLS
ALTER TABLE public.subscription_members ENABLE ROW LEVEL SECURITY;

-- Policies (Examples - Adjust based on your Auth rules)
-- Owners can view/edit their members
CREATE POLICY "Owners can manage members" ON public.subscription_members
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.subscriptions s 
        WHERE s.id = subscription_members.subscription_id 
        AND s.owner_id = auth.uid()
    ));

-- Members can view their own record
CREATE POLICY "Members can view themselves" ON public.subscription_members
    FOR SELECT
    USING (user_id = auth.uid());
