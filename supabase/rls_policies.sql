-- Row Level Security (RLS) policies for AmateurBaleares
-- Ejecutar en Supabase SQL Editor después de schema.sql
-- IMPORTANTE: Este archivo elimina y recrea todas las políticas.
-- Ejecutar una sola vez después de cambios.

-- ============================================================
-- USERS table
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_select_public" ON users;
CREATE POLICY "users_select_public" ON users
  FOR SELECT USING (auth.uid() != id AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_delete_admin" ON users;
CREATE POLICY "users_delete_admin" ON users
  FOR DELETE USING (auth.uid() = id);

-- ============================================================
-- CLUBS table
-- ============================================================
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clubs_select_auth" ON clubs;
CREATE POLICY "clubs_select_auth" ON clubs
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "clubs_insert_entrenador_club" ON clubs;
CREATE POLICY "clubs_insert_entrenador_club" ON clubs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "clubs_update_owner_admin" ON clubs;
CREATE POLICY "clubs_update_owner_admin" ON clubs
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "clubs_delete_owner_admin" ON clubs;
CREATE POLICY "clubs_delete_owner_admin" ON clubs
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================================
-- TEAMS table
-- ============================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teams_select_auth" ON teams;
CREATE POLICY "teams_select_auth" ON teams
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "teams_insert_auth" ON teams;
CREATE POLICY "teams_insert_auth" ON teams
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "teams_update_coach" ON teams;
CREATE POLICY "teams_update_coach" ON teams
  FOR UPDATE USING (
    auth.uid() = coach_id
    OR coach_id IS NULL
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

DROP POLICY IF EXISTS "teams_delete_coach" ON teams;
CREATE POLICY "teams_delete_coach" ON teams
  FOR DELETE USING (auth.uid() = coach_id);

-- ============================================================
-- PLAYERS table
-- ============================================================
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "players_select_auth" ON players;
CREATE POLICY "players_select_auth" ON players
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "players_insert_auth" ON players;
CREATE POLICY "players_insert_auth" ON players
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "players_update_auth" ON players;
CREATE POLICY "players_update_auth" ON players
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "players_delete_auth" ON players;
CREATE POLICY "players_delete_auth" ON players
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- MATCHES table
-- ============================================================
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_select_auth" ON matches;
CREATE POLICY "matches_select_auth" ON matches
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "matches_insert_auth" ON matches;
CREATE POLICY "matches_insert_auth" ON matches
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "matches_update_auth" ON matches;
CREATE POLICY "matches_update_auth" ON matches
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "matches_delete_auth" ON matches;
CREATE POLICY "matches_delete_auth" ON matches
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- MATCH_EVENTS table
-- ============================================================
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_events_select_auth" ON match_events;
CREATE POLICY "match_events_select_auth" ON match_events
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "match_events_insert_auth" ON match_events;
CREATE POLICY "match_events_insert_auth" ON match_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "match_events_update_auth" ON match_events;
CREATE POLICY "match_events_update_auth" ON match_events
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "match_events_delete_auth" ON match_events;
CREATE POLICY "match_events_delete_auth" ON match_events
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- PLAYER_STATS table
-- ============================================================
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_stats_select_auth" ON player_stats;
CREATE POLICY "player_stats_select_auth" ON player_stats
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "player_stats_update_auth" ON player_stats;
CREATE POLICY "player_stats_update_auth" ON player_stats
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "player_stats_insert_auth" ON player_stats;
CREATE POLICY "player_stats_insert_auth" ON player_stats
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
