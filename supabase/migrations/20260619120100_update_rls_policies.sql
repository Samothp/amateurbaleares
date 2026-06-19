-- Update RLS policies for new role system
-- Execute in Supabase SQL Editor

-- ============================================================
-- TEAMS: Restrict INSERT to Admin only
-- ============================================================
DROP POLICY IF EXISTS "teams_insert_auth" ON teams;
DROP POLICY IF EXISTS "teams_insert_admin" ON teams;
CREATE POLICY "teams_insert_admin" ON teams
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- ============================================================
-- USERS: Admin can update any user
-- ============================================================
DROP POLICY IF EXISTS "users_update_admin" ON users;
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

-- ============================================================
-- ADMIN_NOTIFICATIONS table
-- ============================================================
ALTER TABLE IF EXISTS admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_notifications_select_admin" ON admin_notifications;
CREATE POLICY "admin_notifications_select_admin" ON admin_notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );

DROP POLICY IF EXISTS "admin_notifications_insert_system" ON admin_notifications;
CREATE POLICY "admin_notifications_insert_system" ON admin_notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "admin_notifications_update_admin" ON admin_notifications;
CREATE POLICY "admin_notifications_update_admin" ON admin_notifications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  );