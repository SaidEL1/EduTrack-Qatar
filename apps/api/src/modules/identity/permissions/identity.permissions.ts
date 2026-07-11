/** Identity permission codes — FR-SET-003 */
export const IDENTITY_PERMISSIONS = {
  USER_READ: 'identity.user.read',
  USER_WRITE: 'identity.user.write',
  USER_DEACTIVATE: 'identity.user.deactivate',
  ROLE_READ: 'identity.role.read',
  ROLE_ASSIGN: 'identity.role.assign',
  MEMBERSHIP_READ: 'identity.membership.read',
  MEMBERSHIP_WRITE: 'identity.membership.write',
  MFA_MANAGE: 'identity.mfa.manage',
  SESSION_READ: 'identity.session.read',
  SESSION_REVOKE: 'identity.session.revoke',
  INVITATION_READ: 'identity.invitation.read',
  INVITATION_WRITE: 'identity.invitation.write',
  SECURITY_READ: 'identity.security.read',
  SECURITY_SETTINGS_READ: 'identity.security.settings.read',
  SECURITY_SETTINGS_WRITE: 'identity.security.settings.write',
} as const;

export type IdentityPermissionCode =
  (typeof IDENTITY_PERMISSIONS)[keyof typeof IDENTITY_PERMISSIONS];

export const DEFAULT_IDENTITY_PERMISSIONS: readonly IdentityPermissionCode[] =
  Object.values(IDENTITY_PERMISSIONS);

export const TENANT_ADMIN_ROLE_CODE = 'tenant_admin';
