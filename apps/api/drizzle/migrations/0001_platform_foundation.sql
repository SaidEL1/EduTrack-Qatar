-- Sprint 1 platform schema — EDU-ARCH-005 TDR-003 (tenant_id on all tenant tables)
CREATE TYPE "tenant_status" AS ENUM ('active', 'suspended', 'provisioning');

CREATE TABLE IF NOT EXISTS "tenants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(64) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "status" "tenant_status" DEFAULT 'provisioning' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "schools" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "name" varchar(255) NOT NULL,
  "legal_name" varchar(255),
  "logo_url" text,
  "contact_email" varchar(255),
  "contact_phone" varchar(32),
  "timezone" varchar(64) DEFAULT 'Asia/Qatar' NOT NULL,
  "locale_default" varchar(16) DEFAULT 'en-QA' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "schools_tenant_id_idx" ON "schools" ("tenant_id");

CREATE TABLE IF NOT EXISTS "campuses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "school_id" uuid NOT NULL REFERENCES "schools"("id") ON DELETE cascade,
  "name" varchar(255) NOT NULL,
  "code" varchar(32) NOT NULL,
  "address_line1" varchar(255),
  "city" varchar(128),
  "country_code" varchar(2) DEFAULT 'QA' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "academic_years" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "name" varchar(128) NOT NULL,
  "start_date" timestamp with time zone NOT NULL,
  "end_date" timestamp with time zone NOT NULL,
  "is_current" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "academic_terms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE cascade,
  "name" varchar(128) NOT NULL,
  "start_date" timestamp with time zone NOT NULL,
  "end_date" timestamp with time zone NOT NULL,
  "sort_order" varchar(8) DEFAULT '1' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "actor_id" varchar(128),
  "action" varchar(128) NOT NULL,
  "entity_type" varchar(128) NOT NULL,
  "entity_id" varchar(128) NOT NULL,
  "before_state" jsonb,
  "after_state" jsonb,
  "ip_address" varchar(64),
  "correlation_id" varchar(64),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "system_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "key" varchar(128) NOT NULL,
  "value" jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "system_settings_tenant_key_idx" ON "system_settings" ("tenant_id", "key");

CREATE TABLE IF NOT EXISTS "feature_flags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "key" varchar(128) NOT NULL,
  "enabled" boolean DEFAULT false NOT NULL,
  "metadata" jsonb,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "feature_flags_tenant_key_idx" ON "feature_flags" ("tenant_id", "key");

CREATE TABLE IF NOT EXISTS "permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(128) NOT NULL UNIQUE,
  "description" varchar(255) NOT NULL,
  "module" varchar(64) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "code" varchar(64) NOT NULL,
  "name" varchar(128) NOT NULL,
  "is_system" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "roles_tenant_code_idx" ON "roles" ("tenant_id", "code");

CREATE TABLE IF NOT EXISTS "role_permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE cascade,
  "permission_id" uuid NOT NULL REFERENCES "permissions"("id") ON DELETE cascade
);

CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_permission_idx" ON "role_permissions" ("role_id", "permission_id");

-- RLS foundation (policies activated in Sprint 2 with auth context)
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
