-- Migración: Sistema de solicitud de rol y aprobación Admin
-- Ejecutar en Supabase SQL Editor

-- ============================================================
-- USERS table - Nuevas columnas
-- ============================================================

-- Role status: 'none' (no solicitado), 'pending', 'approved', 'rejected'
ALTER TABLE users ADD COLUMN IF NOT EXISTS requested_role text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_status text DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_requested_at timestamptz;

-- Campos extra para roles específicos (perfil público)
ALTER TABLE users ADD COLUMN IF NOT EXISTS license text;              -- Entrenador: titulación
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years int;      -- Entrenador: años experiencia
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_formation text;  -- Entrenador: sistema preferido
ALTER TABLE users ADD COLUMN IF NOT EXISTS club_name text;            -- Club: nombre club
ALTER TABLE users ADD COLUMN IF NOT EXISTS position_in_club text;     -- Club: cargo (presidente, DD, etc)
ALTER TABLE users ADD COLUMN IF NOT EXISTS scout_zone text;           -- Ojeador: zona geográfica
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_categories text[]; -- Ojeador: categorías interés
ALTER TABLE users ADD COLUMN IF NOT EXISTS scout_experience text;     -- Ojeador: experiencia
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_team_id uuid REFERENCES teams(id); -- Jugador: equipo actual
ALTER TABLE users ADD COLUMN IF NOT EXISTS position text;             -- Jugador: posición
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_year int;            -- Jugador: año nacimiento
ALTER TABLE users ADD COLUMN IF NOT EXISTS dominant_foot text;        -- Jugador: pierna dominante
ALTER TABLE users ADD COLUMN IF NOT EXISTS height numeric;            -- Jugador: altura
ALTER TABLE users ADD COLUMN IF NOT EXISTS weight numeric;            -- Jugador: peso

-- Índices para consultas de aprobación
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role_status);
CREATE INDEX IF NOT EXISTS idx_users_requested_role ON users(requested_role);

-- ============================================================
-- Actualizar constraint de role para incluir nuevos valores
-- ============================================================
-- Nota: Si hay constraint CHECK en role, actualizarlo. Si no, solo documentamos valores válidos:
-- 'Admin', 'Club', 'Entrenador', 'Ojeador', 'Jugador', 'Aficionado'

-- ============================================================
-- Tabla para notificaciones admin (opcional, para email)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'role_request', 'role_approved', 'role_rejected'
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  requested_role text,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_notifications_select_admin" ON admin_notifications;
CREATE POLICY "admin_notifications_select_admin" ON admin_notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

DROP POLICY IF EXISTS "admin_notifications_insert_system" ON admin_notifications;
CREATE POLICY "admin_notifications_insert_system" ON admin_notifications
  FOR INSERT WITH CHECK (true); -- Se inserta via service role o trigger

-- ============================================================
-- Trigger para notificar Admin al solicitar rol (requiere Edge Function o pg_notify)
-- ============================================================
-- Opción A: pg_notify + Edge Function listening (recomendado)
-- Opción B: Supabase Database Webhook
-- Se implementará en Edge Function separada