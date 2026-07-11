import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { PermissionGuard } from './guards/permission.guard.js';
import { PermissionEngine } from './permission-engine.service.js';

@Global()
@Module({
  providers: [
    PermissionEngine,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
  exports: [PermissionEngine],
})
export class SecurityModule {}
