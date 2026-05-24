-- Supabase / PostgreSQL schema inicial basado en el Dossier

-- users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE,
  role text,
  created_at timestamptz DEFAULT now()
);

-- clubs
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  crest text,
  created_at timestamptz DEFAULT now()
);

-- teams
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES clubs(id) ON DELETE SET NULL,
  category text,
  coach_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text,
  created_at timestamptz DEFAULT now()
);

-- players
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text,
  age int,
  position text,
  dorsal int,
  height numeric,
  weight numeric,
  dominant_foot text,
  photo text,
  created_at timestamptz DEFAULT now()
);

-- matches
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  opponent text,
  date timestamptz,
  result text,
  lineup jsonb,
  created_at timestamptz DEFAULT now()
);

-- match_events
CREATE TABLE IF NOT EXISTS match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  event_type text,
  minute int,
  x_coord numeric,
  y_coord numeric,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- player_stats (materialized or aggregated table)
CREATE TABLE IF NOT EXISTS player_stats (
  player_id uuid PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  goals int DEFAULT 0,
  assists int DEFAULT 0,
  minutes int DEFAULT 0,
  yellow_cards int DEFAULT 0,
  red_cards int DEFAULT 0,
  pass_accuracy numeric DEFAULT 0,
  duels_won int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
