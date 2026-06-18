-- Add jornada column to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS jornada int;

-- Create index for jornada-based grouping
CREATE INDEX IF NOT EXISTS idx_matches_jornada ON matches(jornada);

-- Update existing matches with jornada data from matches_full_season.json
-- This will be done via the import script or manually
