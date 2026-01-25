-- Migration: Add Foreign Key to Subscriptions table
-- Date: 2026-01-25
-- Description: Adds a foreign key constraint linking subscriptions.owner_id to auth.users.id

ALTER TABLE public.subscriptions
ADD CONSTRAINT fk_subscriptions_owner
FOREIGN KEY (owner_id)
REFERENCES auth.users (id)
ON DELETE CASCADE;
