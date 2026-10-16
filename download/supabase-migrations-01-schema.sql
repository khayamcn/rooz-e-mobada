-- ──────────────────────────────────────────────────────────────
-- Rooz-e Mobada — Initial Schema Migration (PostgreSQL/Supabase)
-- Version: 1.0.0
-- ──────────────────────────────────────────────────────────────

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ───── users ─────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile          TEXT NOT NULL UNIQUE,
  mobile_verified BOOLEAN NOT NULL DEFAULT FALSE,
  display_name    TEXT NOT NULL,
  national_id     TEXT, -- فقط در صورت نیاز؛ hash شده در صورت حساس شدن
  avatar_url      TEXT,
  family_id       UUID REFERENCES families(id) ON DELETE SET NULL,
  role            TEXT NOT NULL DEFAULT 'viewer'
                  CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ
);

CREATE INDEX idx_users_mobile ON users(mobile) WHERE mobile_verified = TRUE;
CREATE INDEX idx_users_family ON users(family_id);

-- ───── families ─────
CREATE TABLE families (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  invite_code     TEXT UNIQUE, -- 6-char code; stored as hash
  invite_expires_at TIMESTAMPTZ,
  invite_revoked  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_families_owner ON families(owner_id);
CREATE INDEX idx_families_invite ON families(invite_code) WHERE invite_revoked = FALSE;

-- ───── family_members ─────
CREATE TABLE family_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'viewer'
                  CHECK (role IN ('admin', 'editor', 'viewer')),
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'revoked', 'pending')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ,
  UNIQUE (family_id, user_id)
);

CREATE INDEX idx_family_members_family ON family_members(family_id) WHERE status = 'active';
CREATE INDEX idx_family_members_user ON family_members(user_id) WHERE status = 'active';

-- ───── family_invitations ─────
CREATE TABLE family_invitations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  code_hash       TEXT NOT NULL UNIQUE, -- hash of invite code; never store raw
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,
  max_uses        INT NOT NULL DEFAULT 5,
  use_count       INT NOT NULL DEFAULT 0,
  used_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_family ON family_invitations(family_id) WHERE revoked_at IS NULL;

-- ───── otp_requests ─────
CREATE TABLE otp_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile          TEXT NOT NULL,
  code_hash       TEXT NOT NULL, -- bcrypt/argon2 hash of OTP
  expires_at      TIMESTAMPTZ NOT NULL,
  attempts        INT NOT NULL DEFAULT 0,
  max_attempts    INT NOT NULL DEFAULT 5,
  consumed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_mobile ON otp_requests(mobile) WHERE consumed_at IS NULL;

-- ───── audit_log (security events) ─────
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type      TEXT NOT NULL, -- 'invite_created', 'invite_accepted', 'role_changed', 'member_removed', 'access_revoked'
  family_id       UUID REFERENCES families(id) ON DELETE CASCADE,
  details         JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_log(actor_user_id);
CREATE INDEX idx_audit_family ON audit_log(family_id);
CREATE INDEX idx_audit_event ON audit_log(event_type);

-- ───── folders ─────
CREATE TABLE folders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES folders(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  is_private      BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_folders_family ON folders(family_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_folders_parent ON folders(parent_id) WHERE deleted_at IS NULL;

-- ───── files ─────
CREATE TABLE files (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  folder_id       UUID REFERENCES folders(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  storage_key     TEXT NOT NULL, -- path in Supabase Storage bucket
  mime_type       TEXT NOT NULL,
  size_bytes      BIGINT NOT NULL,
  checksum_sha256 TEXT,
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_private      BOOLEAN NOT NULL DEFAULT FALSE,
  is_offline_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ, -- soft delete for trash retention
  purge_after     TIMESTAMPTZ, -- automatic permanent delete after retention
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_family ON files(family_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_folder ON files(folder_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_owner ON files(owner_id);
CREATE INDEX idx_files_purge ON files(purge_after) WHERE purge_after IS NOT NULL;

-- ───── file_permissions ─────
CREATE TABLE file_permissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id         UUID REFERENCES files(id) ON DELETE CASCADE,
  folder_id       UUID REFERENCES folders(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  role_target     TEXT CHECK (role_target IN ('admin', 'editor', 'viewer')),
  can_view        BOOLEAN NOT NULL DEFAULT TRUE,
  can_download    BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit        BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete      BOOLEAN NOT NULL DEFAULT FALSE,
  granted_by      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (file_id IS NOT NULL OR folder_id IS NOT NULL),
  CHECK (user_id IS NOT NULL OR role_target IS NOT NULL)
);

CREATE INDEX idx_perms_file ON file_permissions(file_id);
CREATE INDEX idx_perms_folder ON file_permissions(folder_id);

-- ───── file_activity_log ─────
CREATE TABLE file_activity_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id         UUID REFERENCES files(id) ON DELETE SET NULL,
  folder_id       UUID REFERENCES folders(id) ON DELETE SET NULL,
  family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  actor_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name      TEXT NOT NULL,
  action          TEXT NOT NULL CHECK (action IN ('upload','rename','move','delete','restore','download','permission_change','preview')),
  details         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_file ON file_activity_log(file_id);
CREATE INDEX idx_activity_family ON file_activity_log(family_id);

-- ───── storage_quotas ─────
CREATE TABLE storage_quotas (
  family_id       UUID PRIMARY KEY REFERENCES families(id) ON DELETE CASCADE,
  total_bytes     BIGINT NOT NULL DEFAULT 1073741824, -- 1 GB default
  used_bytes      BIGINT NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_family_created_quota
  AFTER INSERT ON families
  FOR EACH ROW
  BEGIN
    INSERT INTO storage_quotas (family_id, total_bytes, used_bytes)
    VALUES (NEW.id, 1073741824, 0);
  END;

-- ───── sync_outbox (Local-first sync log) ─────
CREATE TABLE sync_outbox (
  operation_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_table    TEXT NOT NULL,
  entity_id       UUID NOT NULL,
  operation_type  TEXT NOT NULL CHECK (operation_type IN ('INSERT','UPDATE','SOFT_DELETE')),
  payload_json    JSONB NOT NULL,
  base_version    INT NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','in_progress','failed','conflict','applied')),
  retry_count     INT NOT NULL DEFAULT 0,
  next_retry_at   TIMESTAMPTZ,
  last_error      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at      TIMESTAMPTZ
);

CREATE INDEX idx_outbox_status ON sync_outbox(status, next_retry_at) WHERE status IN ('pending', 'failed');

-- ───── processed_sync_operations (idempotency) ─────
CREATE TABLE processed_sync_operations (
  operation_id    UUID PRIMARY KEY,
  family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_processed_family ON processed_sync_operations(family_id);

-- ───── updated_at triggers ─────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_folders_updated BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_files_updated BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_quotas_updated BEFORE UPDATE ON storage_quotas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ───── Storage quota enforcement trigger ─────
CREATE OR REPLACE FUNCTION enforce_storage_quota()
RETURNS TRIGGER AS $$
DECLARE
  quota_total BIGINT;
  quota_used BIGINT;
BEGIN
  SELECT total_bytes, used_bytes INTO quota_total, quota_used
  FROM storage_quotas WHERE family_id = NEW.family_id FOR UPDATE;
  IF quota_used + NEW.size_bytes > quota_total THEN
    RAISE EXCEPTION 'Storage quota exceeded for family %', NEW.family_id
      USING ERRCODE = 'quota_exceeded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_files_quota_check
  BEFORE INSERT ON files
  FOR EACH ROW EXECUTE FUNCTION enforce_storage_quota();

CREATE OR REPLACE FUNCTION update_quota_on_file_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE storage_quotas SET used_bytes = used_bytes + NEW.size_bytes
    WHERE family_id = NEW.family_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE storage_quotas SET used_bytes = GREATEST(0, used_bytes - OLD.size_bytes)
    WHERE family_id = OLD.family_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_files_quota_update
  AFTER INSERT OR DELETE ON files
  FOR EACH ROW EXECUTE FUNCTION update_quota_on_file_change();

-- Done
