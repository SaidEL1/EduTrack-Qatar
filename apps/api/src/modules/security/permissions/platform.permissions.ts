/** Platform permission codes — RBAC skeleton (FR-SET-003, Sprint 2 completes enforcement) */
export const PLATFORM_PERMISSIONS = {
  TENANT_READ: 'platform.tenant.read',
  TENANT_WRITE: 'platform.tenant.write',
  SCHOOL_READ: 'platform.school.read',
  SCHOOL_WRITE: 'platform.school.write',
  CAMPUS_READ: 'platform.campus.read',
  CAMPUS_WRITE: 'platform.campus.write',
  ACADEMIC_YEAR_READ: 'platform.academic_year.read',
  ACADEMIC_YEAR_WRITE: 'platform.academic_year.write',
  SETTINGS_READ: 'platform.settings.read',
  SETTINGS_WRITE: 'platform.settings.write',
  FEATURE_FLAG_READ: 'platform.feature_flag.read',
  FEATURE_FLAG_WRITE: 'platform.feature_flag.write',
  AUDIT_READ: 'platform.audit.read',
} as const;

export type PlatformPermissionCode =
  (typeof PLATFORM_PERMISSIONS)[keyof typeof PLATFORM_PERMISSIONS];

export const DEFAULT_PLATFORM_PERMISSIONS: readonly PlatformPermissionCode[] =
  Object.values(PLATFORM_PERMISSIONS);
