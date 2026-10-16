-- ──────────────────────────────────────────────────────────────
-- Rooz-e Mobada — Row Level Security (RLS) Policies
-- Version: 1.0.0
-- ──────────────────────────────────────────────────────────────

-- Enable RLS on every sensitive table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_outbox ENABLE ROW LEVEL SECURITY;

-- Helper: user_id() from auth.uid()
-- In Supabase, auth.uid() returns the current authenticated user's UUID.
-- We map that to users.id via the auth identity.

-- ───── users ─────
CREATE POLICY users_self_select ON users
  FOR SELECT USING (id = auth.uid() OR id IN (
    SELECT user_id FROM family_members
    WHERE family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid() AND status = 'active'
    ) AND status = 'active'
  ));

CREATE POLICY users_self_update ON users
  FOR UPDATE USING (id = auth.uid());

-- ───── families ─────
CREATE POLICY families_member_select ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY families_admin_update ON families
  FOR UPDATE USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY families_owner_delete ON families
  FOR DELETE USING (owner_id = auth.uid());

-- ───── family_members ─────
CREATE POLICY members_family_select ON family_members
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY members_admin_insert ON family_members
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY members_admin_update ON family_members
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- ───── family_invitations ─────
-- Any authenticated user can verify an invitation code against this table
-- (used during join flow). However, only family admins can create/revoke.
CREATE POLICY invitations_family_select ON family_invitations
  FOR SELECT USING (TRUE); -- code is hashed, so SELECT is safe

CREATE POLICY invitations_admin_insert ON family_invitations
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY invitations_admin_update ON family_invitations
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- ───── folders ─────
CREATE POLICY folders_family_select ON folders
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND (
      is_private = FALSE
      OR owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.user_id = auth.uid()
          AND fm.family_id = folders.family_id
          AND fm.role = 'admin'
      )
    )
  );

CREATE POLICY folders_member_insert ON folders
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY folders_owner_or_admin_update ON folders
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.user_id = auth.uid() AND fm.role = 'admin'
        AND fm.family_id = folders.family_id
    )
  );

CREATE POLICY folders_owner_or_admin_delete ON folders
  FOR DELETE USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.user_id = auth.uid() AND fm.role = 'admin'
        AND fm.family_id = folders.family_id
    )
  );

-- ───── files ─────
CREATE POLICY files_family_select ON files
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND (
      is_private = FALSE
      OR owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.user_id = auth.uid()
          AND fm.family_id = files.family_id
          AND fm.role = 'admin'
      )
      OR EXISTS (
        SELECT 1 FROM file_permissions fp
        WHERE fp.file_id = files.id
          AND fp.user_id = auth.uid()
          AND fp.can_view = TRUE
      )
    )
  );

CREATE POLICY files_member_insert ON files
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY files_owner_or_admin_update ON files
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.user_id = auth.uid() AND fm.role = 'admin'
        AND fm.family_id = files.family_id
    )
  );

CREATE POLICY files_owner_or_admin_delete ON files
  FOR DELETE USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.user_id = auth.uid() AND fm.role = 'admin'
        AND fm.family_id = files.family_id
    )
  );

-- ───── file_permissions ─────
CREATE POLICY perms_admin_all ON file_permissions
  FOR ALL USING (
    -- Admin of the family can see all permissions
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.user_id = auth.uid() AND fm.role = 'admin'
        AND fm.family_id = (
          SELECT family_id FROM files WHERE id = file_id
          UNION ALL
          SELECT family_id FROM folders WHERE id = folder_id
        )
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.user_id = auth.uid() AND fm.role = 'admin'
        AND fm.family_id = (
          SELECT family_id FROM files WHERE id = file_id
          UNION ALL
          SELECT family_id FROM folders WHERE id = folder_id
        )
    )
  );

-- ───── file_activity_log ─────
CREATE POLICY activity_family_select ON file_activity_log
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY activity_member_insert ON file_activity_log
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ───── storage_quotas ─────
CREATE POLICY quotas_family_select ON storage_quotas
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Quotas are updated only by triggers, not directly by users.

-- ───── otp_requests ─────
-- Users can only see their own OTP requests (by mobile).
-- Insert is allowed via Edge Function with rate-limiting.
CREATE POLICY otp_self_select ON otp_requests
  FOR SELECT USING (mobile = (SELECT mobile FROM users WHERE id = auth.uid()));

-- ───── audit_log ─────
-- Admins can read audit_log entries for their family.
CREATE POLICY audit_admin_select ON audit_log
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- ───── sync_outbox ─────
CREATE POLICY outbox_owner_select ON sync_outbox
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY outbox_owner_insert ON sync_outbox
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY outbox_owner_update ON sync_outbox
  FOR UPDATE USING (user_id = auth.uid());

-- ───── Storage Bucket policies ─────
-- Run in Supabase Storage SQL editor:
--
-- CREATE BUCKET "family-files-private"
--   WITH (public = FALSE);
--
-- CREATE POLICY storage_family_upload ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (
--     bucket_id = 'family-files-private'
--     AND EXISTS (
--       SELECT 1 FROM files f
--       JOIN family_members fm ON fm.family_id = f.family_id
--       WHERE f.storage_key = name
--         AND fm.user_id = auth.uid()
--         AND fm.status = 'active'
--         AND fm.role IN ('admin', 'editor')
--     )
--   );
--
-- CREATE POLICY storage_family_read ON storage.objects
--   FOR SELECT TO authenticated
--   USING (
--     bucket_id = 'family-files-private'
--     AND EXISTS (
--       SELECT 1 FROM files f
--       JOIN family_members fm ON fm.family_id = f.family_id
--       WHERE f.storage_key = name
--         AND fm.user_id = auth.uid()
--         AND fm.status = 'active'
--         AND (
--           f.is_private = FALSE
--           OR f.owner_id = auth.uid()
--           OR fm.role = 'admin'
--         )
--     )
--   );
--
-- CREATE POLICY storage_owner_delete ON storage.objects
--   FOR DELETE TO authenticated
--   USING (
--     bucket_id = 'family-files-private'
--     AND EXISTS (
--       SELECT 1 FROM files f
--       WHERE f.storage_key = name
--         AND (f.owner_id = auth.uid()
--              OR EXISTS (
--                SELECT 1 FROM family_members fm
--                WHERE fm.user_id = auth.uid()
--                  AND fm.role = 'admin'
--                  AND fm.family_id = f.family_id
--              ))
--     )
--   );
