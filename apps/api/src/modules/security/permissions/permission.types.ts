import type { IdentityPermissionCode } from '../../identity/permissions/identity.permissions.js';

import type { PlatformPermissionCode } from './platform.permissions.js';

export type PermissionCode = PlatformPermissionCode | IdentityPermissionCode;
