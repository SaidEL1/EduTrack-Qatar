import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CORRELATION_ID_HEADER } from '../../../common/middleware/correlation-id.middleware.js';
import { TENANT_ID_HEADER } from '../../../common/middleware/tenant-context.middleware.js';
import { definedFields } from '../../../common/utils/defined-fields.js';
import { CurrentUser } from '../../security/decorators/current-user.decorator.js';
import { Public } from '../../security/decorators/public.decorator.js';
import { RequirePermission } from '../../security/decorators/require-permission.decorator.js';
import type { AuthenticatedUser } from '../../security/types/authenticated-user.js';
import { AccountSecurityService } from '../application/account-security.service.js';
import { InvitationService } from '../application/invitation.service.js';
import { SecurityDashboardService } from '../application/security-dashboard.service.js';
import {
  AcceptInvitationDto,
  CreateInvitationDto,
  PasswordResetConfirmDto,
  PasswordResetRequestDto,
  VerifyEmailConfirmDto,
} from '../dto/security.dto.js';
import {
  LoginEventRepository,
  SecurityEventRepository,
} from '../infrastructure/security-event.repository.js';
import { IDENTITY_PERMISSIONS } from '../permissions/identity.permissions.js';

@ApiTags('Identity — Account')
@ApiBearerAuth('access-token')
@Controller('identity/account')
export class AccountController {
  constructor(private readonly accountSecurityService: AccountSecurityService) {}

  @Post('verify-email/request')
  @ApiOperation({ summary: 'Request email verification token' })
  requestEmailVerification(@CurrentUser() user: AuthenticatedUser) {
    return this.accountSecurityService.requestEmailVerification(user.userId);
  }
}

@ApiTags('Identity — Account')
@Controller('identity/account')
export class AccountPublicController {
  constructor(private readonly accountSecurityService: AccountSecurityService) {}

  @Public()
  @Post('verify-email/confirm')
  @ApiOperation({ summary: 'Confirm email verification token' })
  confirmEmailVerification(@Body() body: VerifyEmailConfirmDto) {
    return this.accountSecurityService
      .confirmEmailVerification(body.token)
      .then(() => ({ success: true }));
  }

  @Public()
  @Post('password-reset/request')
  @ApiOperation({ summary: 'Request password reset token' })
  requestPasswordReset(@Body() body: PasswordResetRequestDto) {
    return this.accountSecurityService.requestPasswordReset(body.email);
  }

  @Public()
  @Post('password-reset/confirm')
  @ApiOperation({ summary: 'Reset password with token' })
  confirmPasswordReset(@Body() body: PasswordResetConfirmDto) {
    return this.accountSecurityService
      .confirmPasswordReset(body.token, body.newPassword)
      .then(() => ({ success: true }));
  }
}

@ApiTags('Identity — Invitations')
@ApiBearerAuth('access-token')
@Controller('identity/invitations')
export class InvitationsController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @RequirePermission(IDENTITY_PERMISSIONS.INVITATION_WRITE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  create(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Body() body: CreateInvitationDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.invitationService.createInvitation(
      {
        tenantId,
        email: body.email,
        invitedBy: actor.userId,
        ...definedFields({ roleId: body.roleId }),
      },
      correlationId,
    );
  }

  @Get()
  @RequirePermission(IDENTITY_PERMISSIONS.INVITATION_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  list(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.invitationService.listInvitations(tenantId);
  }
}

@ApiTags('Auth')
@Controller('auth/invitations')
export class InvitationAcceptController {
  constructor(private readonly invitationService: InvitationService) {}

  @Public()
  @Post('accept')
  @ApiOperation({ summary: 'Accept invitation and activate account' })
  accept(
    @Body() body: AcceptInvitationDto,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.invitationService.acceptInvitation(body, correlationId);
  }
}

@ApiTags('Identity — Security Monitoring')
@ApiBearerAuth('access-token')
@Controller('identity/security')
export class SecurityMonitoringController {
  constructor(
    private readonly loginEventRepository: LoginEventRepository,
    private readonly securityEventRepository: SecurityEventRepository,
    private readonly securityDashboardService: SecurityDashboardService,
  ) {}

  @Get('dashboard')
  @RequirePermission(IDENTITY_PERMISSIONS.SECURITY_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  @ApiOperation({ summary: 'Security dashboard summary' })
  dashboard(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.securityDashboardService.getSummary(tenantId);
  }

  @Get('analytics/logins')
  @RequirePermission(IDENTITY_PERMISSIONS.SECURITY_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  loginAnalytics(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.securityDashboardService.getLoginAnalytics(tenantId);
  }

  @Get('reports/failed-logins')
  @RequirePermission(IDENTITY_PERMISSIONS.SECURITY_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  failedLogins(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.securityDashboardService.getFailedLoginReport(tenantId);
  }

  @Get('sessions/active')
  @RequirePermission(IDENTITY_PERMISSIONS.SECURITY_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  activeSessions(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.securityDashboardService.getActiveSessions(tenantId);
  }

  @Get('login-events')
  @RequirePermission(IDENTITY_PERMISSIONS.SECURITY_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  loginEvents(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.loginEventRepository.listByTenant(tenantId);
  }

  @Get('events')
  @RequirePermission(IDENTITY_PERMISSIONS.SECURITY_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  securityEvents(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.securityEventRepository.listByTenant(tenantId);
  }
}
