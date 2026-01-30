-- Migration: Remove birth_year column from teams table
-- Date: 2026-01-30
-- Description: Eliminates the birth_year column from the teams table as it's no longer needed in the application

-- Drop the index on birth_year first
DROP INDEX IF EXISTS idx_teams_birth_year;

-- Drop the birth_year column from teams table
ALTER TABLE teams 
DROP COLUMN IF EXISTS birth_year;

-- Add comment to document the change
COMMENT ON TABLE teams IS 'Teams table - birth_year column removed on 2026-01-30';
