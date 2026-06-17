-- Row Level Security (RLS) policies for AmateurBaleares
-- Ejecutar en Supabase SQL Editor después de schema.sql

-- ============================================================
-- USERS table
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Cada usuario puede ver su propio perfil
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Cualquier usuario autenticado puede ver nombres y roles (para listados)
CREATE POLICY "users_select_public" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Cada usuario puede actualizar su propio perfil
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Solo admin puede eliminar usuarios
CREATE POLICY "users_delete_admin" ON users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- ============================================================
-- CLUBS table
-- ============================================================
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver clubes
CREATE POLICY "clubs_select_auth" ON clubs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Entrenadores y clubs pueden crear clubes
CREATE POLICY "clubs_insert_entrenador_club" ON clubs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Entrenador', 'Club', 'Admin'))
  );

-- Solo el club creado o admin puede actualizar
CREATE POLICY "clubs_update_owner_admin" ON clubs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- ============================================================
-- TEAMS table
-- ============================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver equipos
CREATE POLICY "teams_select_auth" ON teams
  FOR SELECT USING (auth.role() = 'authenticated');

-- Entrenadores y clubs pueden crear equipos
CREATE POLICY "teams_insert_entrenador_club" ON teams
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Entrenador', 'Club', 'Admin'))
  );

-- Entrenador asignado o admin puede actualizar
CREATE POLICY "teams_update_coach_admin" ON teams
  FOR UPDATE USING (
    coach_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- Entrenador asignado o admin puede eliminar
CREATE POLICY "teams_delete_coach_admin" ON teams
  FOR DELETE USING (
    coach_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- ============================================================
-- PLAYERS table
-- ============================================================
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver jugadores
CREATE POLICY "players_select_auth" ON players
  FOR SELECT USING (auth.role() = 'authenticated');

-- Entrenadores, clubs y admin pueden crear jugadores
CREATE POLICY "players_insert_entrenador_club" ON players
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Entrenador', 'Club', 'Admin'))
  );

-- Entrenador del equipo o admin puede actualizar
CREATE POLICY "players_update_coach_admin" ON players
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = players.team_id AND teams.coach_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- Entrenador del equipo o admin puede eliminar
CREATE POLICY "players_delete_coach_admin" ON players
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = players.team_id AND teams.coach_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- ============================================================
-- MATCHES table
-- ============================================================
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver partidos
CREATE POLICY "matches_select_auth" ON matches
  FOR SELECT USING (auth.role() = 'authenticated');

-- Entrenadores y clubs pueden crear partidos
CREATE POLICY "matches_insert_entrenador_club" ON matches
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Entrenador', 'Club', 'Admin'))
  );

-- Entrenador del equipo o admin puede actualizar
CREATE POLICY "matches_update_coach_admin" ON matches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = matches.team_id AND teams.coach_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- Entrenador del equipo o admin puede eliminar
CREATE POLICY "matches_delete_coach_admin" ON matches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = matches.team_id AND teams.coach_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- ============================================================
-- MATCH_EVENTS table
-- ============================================================
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver eventos
CREATE POLICY "match_events_select_auth" ON match_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Entrenadores y clubs pueden crear eventos
CREATE POLICY "match_events_insert_entrenador_club" ON match_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Entrenador', 'Club', 'Admin'))
  );

-- Entrenador del equipo del partido o admin puede actualizar
CREATE POLICY "match_events_update_coach_admin" ON match_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM matches
      JOIN teams ON teams.id = matches.team_id
      WHERE matches.id = match_events.match_id AND teams.coach_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- Entrenador del equipo del partido o admin puede eliminar
CREATE POLICY "match_events_delete_coach_admin" ON match_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM matches
      JOIN teams ON teams.id = matches.team_id
      WHERE matches.id = match_events.match_id AND teams.coach_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- ============================================================
-- PLAYER_STATS table
-- ============================================================
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver estadísticas
CREATE POLICY "player_stats_select_auth" ON player_stats
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo sistema/admin puede modificar estadísticas (se calculan automáticamente)
CREATE POLICY "player_stats_update_admin" ON player_stats
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "player_stats_insert_admin" ON player_stats
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );
