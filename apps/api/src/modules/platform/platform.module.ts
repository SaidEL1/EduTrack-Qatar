import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { IdentityModule } from '../identity/identity.module.js';

import { PlatformController } from './platform.controller.js';
import { PlatformService } from './platform.service.js';

@Module({
  imports: [AuditModule, IdentityModule],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
