import { SetMetadata } from '@nestjs/common';

import type { PlatformPermissionCode } from '../permissions/platform.permissions.js';

export const PERMISSION_KEY = 'required_permission';

export const RequirePermission = (permission: PlatformPermissionCode) =>
  SetMetadata(PERMISSION_KEY, permission);
