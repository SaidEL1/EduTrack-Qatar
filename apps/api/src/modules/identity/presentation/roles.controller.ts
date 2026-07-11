import { Controller, Get, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TENANT_ID_HEADER } from '../../../common/middleware/tenant-context.middleware.js';
import { RequirePermission } from '../../security/decorators/require-permission.decorator.js';
import { RbacRepository } from '../infrastructure/rbac.repository.js';
import { IDENTITY_PERMISSIONS } from '../permissions/identity.permissions.js';

@ApiTags('Identity')
@ApiBearerAuth('access-token')
@Controller('identity/roles')
export class RolesController {
  constructor(private readonly rbacRepository: RbacRepository) {}

  @Get()
  @RequirePermission(IDENTITY_PERMISSIONS.ROLE_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  @ApiOperation({ summary: 'List tenant roles' })
  listRoles(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.rbacRepository.listRoles(tenantId);
  }
}
