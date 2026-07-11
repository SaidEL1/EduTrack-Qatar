import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TENANT_ID_HEADER } from '../../common/middleware/tenant-context.middleware.js';
import { RequirePermission } from '../security/decorators/require-permission.decorator.js';
import { PLATFORM_PERMISSIONS } from '../security/permissions/platform.permissions.js';

import { AuditService } from './audit.service.js';

@ApiTags('Audit')
@ApiHeader({ name: TENANT_ID_HEADER, required: true })
@Controller('platform/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermission(PLATFORM_PERMISSIONS.AUDIT_READ)
  @ApiOperation({ summary: 'List audit log entries for tenant (FR-SET-008)' })
  list(@Headers(TENANT_ID_HEADER) tenantId: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
    return this.auditService.listByTenant(tenantId, parsedLimit);
  }
}
