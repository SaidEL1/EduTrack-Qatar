-- Sprint 2C — Platform Hardening & Communication Foundation

CREATE TYPE "email_outbox_status" AS ENUM ('pending', 'processing', 'sent', 'failed');

CREATE TABLE IF NOT EXISTS "email_outbox" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid REFERENCES "tenants"("id") ON DELETE cascade,
  "template_key" varchar(64) NOT NULL,
  "recipient_email" varchar(255) NOT NULL,
  "subject" varchar(512) NOT NULL,
  "body_text" text NOT NULL,
  "body_html" text,
  "metadata" jsonb,
  "status" "email_outbox_status" DEFAULT 'pending' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "max_attempts" integer DEFAULT 5 NOT NULL,
  "last_error" text,
  "scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "email_outbox_status_scheduled_idx"
  ON "email_outbox" ("status", "scheduled_at");

CREATE INDEX IF NOT EXISTS "email_outbox_tenant_idx"
  ON "email_outbox" ("tenant_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "tenant_security_policies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "mfa_required" boolean DEFAULT false NOT NULL,
  "password_min_length" integer DEFAULT 12 NOT NULL,
  "password_expiry_days" integer DEFAULT 90 NOT NULL,
  "password_history_count" integer DEFAULT 5 NOT NULL,
  "max_active_sessions" integer DEFAULT 10 NOT NULL,
  "session_idle_timeout_minutes" integer DEFAULT 480 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "tenant_security_policies_tenant_id_idx"
  ON "tenant_security_policies" ("tenant_id");

ALTER TABLE "email_outbox" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_security_policies" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_email_outbox ON email_outbox
  USING (
    tenant_id IS NULL
    OR tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid
  );

CREATE POLICY tenant_isolation_tenant_security_policies ON tenant_security_policies
  USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);
