-- Add ffib_code columns for FFIB scraper import
-- Run this in Supabase SQL Editor before importing data

-- Add ffib_code to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS ffib_code text UNIQUE;

-- Add ffib_code to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS ffib_code text;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_clubs_ffib_code ON clubs(ffib_code);
CREATE INDEX IF NOT EXISTS idx_teams_ffib_code ON teams(ffib_code);
