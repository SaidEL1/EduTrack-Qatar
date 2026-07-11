import { Controller, Delete, Get, Headers, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TENANT_ID_HEADER } from '../../../common/middleware/tenant-context.middleware.js';
import { CurrentUser } from '../../security/decorators/current-user.decorator.js';
import { RequirePermission } from '../../security/decorators/require-permission.decorator.js';
import type { AuthenticatedUser } from '../../security/types/authenticated-user.js';
import { SessionManagementService } from '../application/session-management.service.js';
import { IDENTITY_PERMISSIONS } from '../permissions/identity.permissions.js';

@ApiTags('Identity — Sessions')
@ApiBearerAuth('access-token')
@Controller('identity/sessions')
export class SessionsController {
  constructor(private readonly sessionService: SessionManagementService) {}

  @Get()
  @RequirePermission(IDENTITY_PERMISSIONS.SESSION_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  @ApiOperation({ summary: 'List active sessions for current user' })
  list(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService.listSessions(user.userId, tenantId);
  }

  @Delete(':sessionId')
  @RequirePermission(IDENTITY_PERMISSIONS.SESSION_REVOKE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  revoke(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService
      .revokeSession(user.userId, tenantId, sessionId)
      .then(() => ({ success: true }));
  }

  @Post('revoke-all')
  @RequirePermission(IDENTITY_PERMISSIONS.SESSION_REVOKE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  revokeAll(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService
      .revokeAllSessions(user.userId, tenantId)
      .then((count) => ({ revoked: count }));
  }
}
