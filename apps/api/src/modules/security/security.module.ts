import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { IdentityModule } from '../identity/identity.module.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { PermissionGuard } from './guards/permission.guard.js';
import { PermissionEngine } from './permission-engine.service.js';

@Global()
@Module({
  imports: [IdentityModule],
  providers: [
    PermissionEngine,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
  exports: [PermissionEngine],
})
export class SecurityModule {}
