import { Body, Controller, Get, Headers, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CORRELATION_ID_HEADER } from '../../../common/middleware/correlation-id.middleware.js';
import { TENANT_ID_HEADER } from '../../../common/middleware/tenant-context.middleware.js';
import { definedFields } from '../../../common/utils/defined-fields.js';
import { AuditService } from '../../audit/audit.service.js';
import { buildAuditEntry } from '../../platform/platform-audit.helper.js';
import { CurrentUser } from '../../security/decorators/current-user.decorator.js';
import { RequirePermission } from '../../security/decorators/require-permission.decorator.js';
import type { AuthenticatedUser } from '../../security/types/authenticated-user.js';
import { TenantSecurityPolicyService } from '../application/tenant-security-policy.service.js';
import { UpdateTenantSecurityPolicyDto } from '../dto/tenant-security.dto.js';
import { IDENTITY_PERMISSIONS } from '../permissions/identity.permissions.js';

@ApiTags('Identity — Security Settings')
@ApiBearerAuth('access-token')
@Controller('identity/security/settings')
export class TenantSecurityController {
  constructor(
    private readonly tenantSecurityPolicyService: TenantSecurityPolicyService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @RequirePermission(IDENTITY_PERMISSIONS.SECURITY_SETTINGS_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  @ApiOperation({ summary: 'Get tenant security policy' })
  getPolicy(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.tenantSecurityPolicyService.getPolicy(tenantId);
  }

  @Put()
  @RequirePermission(IDENTITY_PERMISSIONS.SECURITY_SETTINGS_WRITE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  @ApiOperation({ summary: 'Update tenant security policy' })
  async updatePolicy(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Body() body: UpdateTenantSecurityPolicyDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    const updated = await this.tenantSecurityPolicyService.updatePolicy(
      tenantId,
      definedFields(body as Record<string, unknown>),
    );
    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId,
          actorId: actor.userId,
          action: 'identity.security.settings.updated',
          entityType: 'tenant_security_policy',
          entityId: tenantId,
          afterState: { ...updated },
        },
        correlationId,
      ),
    );
    return updated;
  }
}
