-- Migration: Add language column to user_profiles
-- Date: 2026-01-30

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';
