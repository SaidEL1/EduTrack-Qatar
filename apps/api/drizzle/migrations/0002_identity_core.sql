-- Sprint 2A identity core — FR-SET-003 / TDR-011 / NFR-SEC-004
CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'disabled', 'locked', 'pending');
CREATE TYPE "membership_status" AS ENUM ('active', 'inactive', 'invited', 'removed');

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) NOT NULL,
  "password_hash" text NOT NULL,
  "status" "user_status" DEFAULT 'pending' NOT NULL,
  "failed_login_attempts" integer DEFAULT 0 NOT NULL,
  "locked_until" timestamp with time zone,
  "last_login_at" timestamp with time zone,
  "password_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_active_idx" ON "users" ("email");

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "first_name" varchar(128) NOT NULL,
  "last_name" varchar(128) NOT NULL,
  "display_name" varchar(255),
  "locale" varchar(16) DEFAULT 'en-QA' NOT NULL,
  "timezone" varchar(64) DEFAULT 'Asia/Qatar' NOT NULL,
  "avatar_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_user_id_idx" ON "user_profiles" ("user_id");

CREATE TABLE IF NOT EXISTS "organization_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "status" "membership_status" DEFAULT 'invited' NOT NULL,
  "joined_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "organization_members_tenant_user_idx"
  ON "organization_members" ("tenant_id", "user_id");

CREATE TABLE IF NOT EXISTS "user_roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE cascade,
  "assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
  "assigned_by" uuid REFERENCES "users"("id") ON DELETE set null
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_tenant_user_role_idx"
  ON "user_roles" ("tenant_id", "user_id", "role_id");

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "tenant_id" uuid REFERENCES "tenants"("id") ON DELETE cascade,
  "token_hash" varchar(128) NOT NULL UNIQUE,
  "family_id" uuid NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "revoked_at" timestamp with time zone,
  "replaced_by" uuid,
  "ip_address" varchar(64),
  "user_agent" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_hash_idx" ON "refresh_tokens" ("token_hash");

CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_idx" ON "refresh_tokens" ("user_id");
CREATE INDEX IF NOT EXISTS "refresh_tokens_expires_at_idx" ON "refresh_tokens" ("expires_at");
CREATE INDEX IF NOT EXISTS "organization_members_user_id_idx" ON "organization_members" ("user_id");
CREATE INDEX IF NOT EXISTS "user_roles_user_id_idx" ON "user_roles" ("user_id");
