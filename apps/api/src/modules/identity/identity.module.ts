import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuditModule } from '../audit/audit.module.js';

import { AuthService } from './application/auth.service.js';
import { UserManagementService } from './application/user-management.service.js';
import { JwtTokenService } from './infrastructure/jwt-token.service.js';
import { PasswordHasherService } from './infrastructure/password-hasher.service.js';
import { PermissionCacheService } from './infrastructure/permission-cache.service.js';
import { RbacRepository } from './infrastructure/rbac.repository.js';
import { RefreshTokenRepository } from './infrastructure/refresh-token.repository.js';
import { AuthController } from './presentation/auth.controller.js';
import { RolesController } from './presentation/roles.controller.js';
import { UsersController } from './presentation/users.controller.js';

@Module({
  imports: [
    AuditModule,
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60_000,
        limit: 20,
      },
    ]),
  ],
  controllers: [AuthController, UsersController, RolesController],
  providers: [
    {
      provide: 'REDIS_URL',
      useFactory: (): string | undefined => process.env['REDIS_URL'],
    },
    AuthService,
    UserManagementService,
    PasswordHasherService,
    JwtTokenService,
    RefreshTokenRepository,
    PermissionCacheService,
    RbacRepository,
  ],
  exports: [AuthService, RbacRepository, JwtTokenService, PermissionCacheService],
})
export class IdentityModule {}
