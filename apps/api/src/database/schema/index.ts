import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const tenantStatusEnum = pgEnum('tenant_status', [
  'active',
  'suspended',
  'provisioning',
]);

export const userStatusEnum = pgEnum('user_status', [
  'active',
  'inactive',
  'disabled',
  'locked',
  'pending',
]);

export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'inactive',
  'invited',
  'removed',
]);

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  status: tenantStatusEnum('status').notNull().default('provisioning'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const schools = pgTable(
  'schools',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    legalName: varchar('legal_name', { length: 255 }),
    logoUrl: text('logo_url'),
    contactEmail: varchar('contact_email', { length: 255 }),
    contactPhone: varchar('contact_phone', { length: 32 }),
    timezone: varchar('timezone', { length: 64 }).notNull().default('Asia/Qatar'),
    localeDefault: varchar('locale_default', { length: 16 }).notNull().default('en-QA'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('schools_tenant_id_idx').on(table.tenantId)],
);

export const campuses = pgTable('campuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  schoolId: uuid('school_id')
    .notNull()
    .references(() => schools.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 32 }).notNull(),
  addressLine1: varchar('address_line1', { length: 255 }),
  city: varchar('city', { length: 128 }),
  countryCode: varchar('country_code', { length: 2 }).notNull().default('QA'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const academicYears = pgTable('academic_years', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 128 }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  isCurrent: boolean('is_current').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const academicTerms = pgTable('academic_terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  academicYearId: uuid('academic_year_id')
    .notNull()
    .references(() => academicYears.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 128 }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  sortOrder: varchar('sort_order', { length: 8 }).notNull().default('1'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  actorId: varchar('actor_id', { length: 128 }),
  action: varchar('action', { length: 128 }).notNull(),
  entityType: varchar('entity_type', { length: 128 }).notNull(),
  entityId: varchar('entity_id', { length: 128 }).notNull(),
  beforeState: jsonb('before_state'),
  afterState: jsonb('after_state'),
  ipAddress: varchar('ip_address', { length: 64 }),
  correlationId: varchar('correlation_id', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const systemSettings = pgTable(
  'system_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 128 }).notNull(),
    value: jsonb('value').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('system_settings_tenant_key_idx').on(table.tenantId, table.key),
  ],
);

export const featureFlags = pgTable(
  'feature_flags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 128 }).notNull(),
    enabled: boolean('enabled').notNull().default(false),
    metadata: jsonb('metadata'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('feature_flags_tenant_key_idx').on(table.tenantId, table.key),
  ],
);

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 128 }).notNull().unique(),
  description: varchar('description', { length: 255 }).notNull(),
  module: varchar('module', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 64 }).notNull(),
    name: varchar('name', { length: 128 }).notNull(),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('roles_tenant_code_idx').on(table.tenantId, table.code)],
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (table) => [
    uniqueIndex('role_permissions_role_permission_idx').on(
      table.roleId,
      table.permissionId,
    ),
  ],
);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    status: userStatusEnum('status').notNull().default('pending'),
    failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    passwordChangedAt: timestamp('password_changed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [uniqueIndex('users_email_active_idx').on(table.email)],
);

export const userProfiles = pgTable(
  'user_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    firstName: varchar('first_name', { length: 128 }).notNull(),
    lastName: varchar('last_name', { length: 128 }).notNull(),
    displayName: varchar('display_name', { length: 255 }),
    locale: varchar('locale', { length: 16 }).notNull().default('en-QA'),
    timezone: varchar('timezone', { length: 64 }).notNull().default('Asia/Qatar'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('user_profiles_user_id_idx').on(table.userId)],
);

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: membershipStatusEnum('status').notNull().default('invited'),
    joinedAt: timestamp('joined_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('organization_members_tenant_user_idx').on(
      table.tenantId,
      table.userId,
    ),
  ],
);

export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
    assignedBy: uuid('assigned_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    uniqueIndex('user_roles_tenant_user_role_idx').on(
      table.tenantId,
      table.userId,
      table.roleId,
    ),
  ],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
    familyId: uuid('family_id').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    replacedBy: uuid('replaced_by'),
    ipAddress: varchar('ip_address', { length: 64 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('refresh_tokens_token_hash_idx').on(table.tokenHash)],
);

export const tenantsRelations = relations(tenants, ({ many }) => ({
  schools: many(schools),
  campuses: many(campuses),
  academicYears: many(academicYears),
  members: many(organizationMembers),
}));

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  tenant: one(tenants, { fields: [schools.tenantId], references: [tenants.id] }),
  campuses: many(campuses),
}));

export const academicYearsRelations = relations(academicYears, ({ many }) => ({
  terms: many(academicTerms),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  memberships: many(organizationMembers),
  roles: many(userRoles),
  refreshTokens: many(refreshTokens),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    user: one(users, { fields: [organizationMembers.userId], references: [users.id] }),
    tenant: one(tenants, {
      fields: [organizationMembers.tenantId],
      references: [tenants.id],
    }),
  }),
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
  tenant: one(tenants, { fields: [userRoles.tenantId], references: [tenants.id] }),
}));
