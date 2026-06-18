-- Add opponent_team_id FK to matches table
-- This allows querying matches where a team appears as either team_id OR opponent_team_id

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS opponent_team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_matches_opponent_team_id ON matches(opponent_team_id);
