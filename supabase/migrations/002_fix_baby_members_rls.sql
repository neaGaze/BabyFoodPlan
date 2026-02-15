-- Fix RLS: allow trigger to insert creator as owner
DROP POLICY IF EXISTS "Owners can add members" ON baby_members;
DROP POLICY IF EXISTS "System can add owner" ON baby_members;

CREATE POLICY "Owners can add members" ON baby_members FOR INSERT WITH CHECK (
  is_baby_owner(baby_id)
  OR
  (role = 'owner' AND user_id IN (SELECT created_by FROM babies WHERE id = baby_id))
);
