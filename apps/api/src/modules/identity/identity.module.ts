import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { TenantRlsInterceptor } from '../../common/interceptors/tenant-rls.interceptor.js';
import { AuditModule } from '../audit/audit.module.js';
import { NotificationModule } from '../notification/notification.module.js';

import { AccountSecurityService } from './application/account-security.service.js';
import { AuthService } from './application/auth.service.js';
import { InvitationService } from './application/invitation.service.js';
import { MfaService } from './application/mfa.service.js';
import { SecurityDashboardService } from './application/security-dashboard.service.js';
import { SessionManagementService } from './application/session-management.service.js';
import { TenantSecurityPolicyService } from './application/tenant-security-policy.service.js';
import { UserManagementService } from './application/user-management.service.js';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard.js';
import {
  InvitationRepository,
  PasswordHistoryRepository,
  SecurityTokenRepository,
  UserMfaRepository,
  UserSessionRepository,
} from './infrastructure/identity-security.repository.js';
import { JwtTokenService } from './infrastructure/jwt-token.service.js';
import { PasswordHasherService } from './infrastructure/password-hasher.service.js';
import { PermissionCacheService } from './infrastructure/permission-cache.service.js';
import { RbacRepository } from './infrastructure/rbac.repository.js';
import { RedisRateLimiterService } from './infrastructure/redis-rate-limiter.service.js';
import { RefreshTokenRepository } from './infrastructure/refresh-token.repository.js';
import { SecretEncryptionService } from './infrastructure/secret-encryption.service.js';
import {
  LoginEventRepository,
  MfaLoginChallengeRepository,
  SecurityEventRepository,
} from './infrastructure/security-event.repository.js';
import { TenantRlsService } from './infrastructure/tenant-rls.service.js';
import { TenantSecurityPolicyRepository } from './infrastructure/tenant-security-policy.repository.js';
import { TotpService } from './infrastructure/totp.service.js';
import { AuthController } from './presentation/auth.controller.js';
import { MfaController } from './presentation/mfa.controller.js';
import { RolesController } from './presentation/roles.controller.js';
import {
  AccountController,
  AccountPublicController,
  InvitationAcceptController,
  InvitationsController,
  SecurityMonitoringController,
} from './presentation/security.controller.js';
import { SessionsController } from './presentation/sessions.controller.js';
import { TenantSecurityController } from './presentation/tenant-security.controller.js';
import { UsersController } from './presentation/users.controller.js';

@Module({
  imports: [
    AuditModule,
    NotificationModule,
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60_000,
        limit: 20,
      },
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    MfaController,
    SessionsController,
    AccountController,
    AccountPublicController,
    InvitationsController,
    InvitationAcceptController,
    SecurityMonitoringController,
    TenantSecurityController,
  ],
  providers: [
    {
      provide: 'REDIS_URL',
      useFactory: (): string | undefined => process.env['REDIS_URL'],
    },
    AuthService,
    UserManagementService,
    MfaService,
    AccountSecurityService,
    SessionManagementService,
    InvitationService,
    PasswordHasherService,
    JwtTokenService,
    RefreshTokenRepository,
    PermissionCacheService,
    RbacRepository,
    SecretEncryptionService,
    TotpService,
    RedisRateLimiterService,
    TenantRlsService,
    TenantSecurityPolicyRepository,
    TenantSecurityPolicyService,
    SecurityDashboardService,
    UserMfaRepository,
    SecurityTokenRepository,
    PasswordHistoryRepository,
    UserSessionRepository,
    InvitationRepository,
    LoginEventRepository,
    SecurityEventRepository,
    MfaLoginChallengeRepository,
    AuthRateLimitGuard,
    {
      provide: APP_GUARD,
      useClass: AuthRateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantRlsInterceptor,
    },
  ],
  exports: [
    AuthService,
    RbacRepository,
    JwtTokenService,
    PermissionCacheService,
    TenantRlsService,
    TenantSecurityPolicyService,
    MfaService,
    SessionManagementService,
    SecurityDashboardService,
  ],
})
export class IdentityModule {}
