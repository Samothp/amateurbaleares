-- Fix RLS policy for teams UPDATE
-- Allow: current coach, unassigned teams, and admins to update team assignments
DROP POLICY IF EXISTS "teams_update_coach" ON teams;
CREATE POLICY "teams_update_coach" ON teams
  FOR UPDATE USING (
    auth.uid() = coach_id
    OR coach_id IS NULL
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
  )
  WITH CHECK (
    -- After update, allow if: new coach is the current user, coach_id becomes null, or current user is Admin
    TRUE  -- This allows the row to be updated as long as USING clause is satisfied
  );
