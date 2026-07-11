import { SetMetadata } from '@nestjs/common';

import type { PermissionCode } from '../permissions/permission.types.js';

export const PERMISSION_KEY = 'required_permission';

export const RequirePermission = (permission: PermissionCode) =>
  SetMetadata(PERMISSION_KEY, permission);
