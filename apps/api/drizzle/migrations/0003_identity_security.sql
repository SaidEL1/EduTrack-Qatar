-- Sprint 2B — Identity Security & Tenant Isolation

CREATE TYPE "security_token_purpose" AS ENUM ('email_verification', 'password_reset');
CREATE TYPE "invitation_status" AS ENUM ('pending', 'accepted', 'expired', 'revoked');
CREATE TYPE "login_event_outcome" AS ENUM (
  'success',
  'failure',
  'mfa_required',
  'mfa_success',
  'mfa_failure',
  'locked',
  'token_reuse'
);
CREATE TYPE "security_event_severity" AS ENUM ('info', 'warning', 'critical');

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "mfa_enabled" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "password_expires_at" timestamp with time zone;

CREATE TABLE IF NOT EXISTS "user_mfa" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "secret_encrypted" text NOT NULL,
  "enabled_at" timestamp with time zone,
  "backup_code_hashes" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_mfa_user_id_idx" ON "user_mfa" ("user_id");

CREATE TABLE IF NOT EXISTS "security_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "purpose" "security_token_purpose" NOT NULL,
  "token_hash" varchar(128) NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  "consumed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "security_tokens_user_purpose_idx"
  ON "security_tokens" ("user_id", "purpose");

CREATE TABLE IF NOT EXISTS "password_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "password_hash" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "password_history_user_id_idx"
  ON "password_history" ("user_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "user_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "family_id" uuid NOT NULL,
  "device_label" varchar(255),
  "ip_address" varchar(64),
  "user_agent" text,
  "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "revoked_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_sessions_family_id_idx" ON "user_sessions" ("family_id");
CREATE INDEX IF NOT EXISTS "user_sessions_user_tenant_idx"
  ON "user_sessions" ("user_id", "tenant_id");

CREATE TABLE IF NOT EXISTS "mfa_login_challenges" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "token_hash" varchar(128) NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  "consumed_at" timestamp with time zone,
  "ip_address" varchar(64),
  "user_agent" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "invitations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "email" varchar(255) NOT NULL,
  "role_id" uuid REFERENCES "roles"("id") ON DELETE set null,
  "token_hash" varchar(128) NOT NULL UNIQUE,
  "status" "invitation_status" DEFAULT 'pending' NOT NULL,
  "invited_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "expires_at" timestamp with time zone NOT NULL,
  "accepted_at" timestamp with time zone,
  "accepted_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "invitations_tenant_status_idx"
  ON "invitations" ("tenant_id", "status");

CREATE TABLE IF NOT EXISTS "login_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid REFERENCES "tenants"("id") ON DELETE cascade,
  "user_id" uuid REFERENCES "users"("id") ON DELETE set null,
  "email" varchar(255) NOT NULL,
  "outcome" "login_event_outcome" NOT NULL,
  "ip_address" varchar(64),
  "user_agent" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "login_events_tenant_created_idx"
  ON "login_events" ("tenant_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "security_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid REFERENCES "tenants"("id") ON DELETE cascade,
  "user_id" uuid REFERENCES "users"("id") ON DELETE set null,
  "event_type" varchar(128) NOT NULL,
  "severity" "security_event_severity" DEFAULT 'info' NOT NULL,
  "ip_address" varchar(64),
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "security_events_tenant_created_idx"
  ON "security_events" ("tenant_id", "created_at" DESC);

-- Row Level Security (TDR-003 / NFR-SEC-006)
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_organization_members ON organization_members
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_user_roles ON user_roles
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_refresh_tokens ON refresh_tokens
  USING (tenant_id IS NULL OR tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_user_sessions ON user_sessions
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_invitations ON invitations
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_login_events ON login_events
  USING (tenant_id IS NULL OR tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_security_events ON security_events
  USING (tenant_id IS NULL OR tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

-- Platform tables (Sprint 1 RLS activation)
CREATE POLICY tenant_isolation_schools ON schools
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_campuses ON campuses
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_academic_years ON academic_years
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_academic_terms ON academic_terms
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_system_settings ON system_settings
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_feature_flags ON feature_flags
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_roles ON roles
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);
