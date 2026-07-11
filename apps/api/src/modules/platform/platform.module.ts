import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { IdentityModule } from '../identity/identity.module.js';

import { SecurityBootstrapService } from './application/security-bootstrap.service.js';
import { PlatformController } from './platform.controller.js';
import { PlatformService } from './platform.service.js';

@Module({
  imports: [AuditModule, IdentityModule],
  controllers: [PlatformController],
  providers: [PlatformService, SecurityBootstrapService],
  exports: [PlatformService, SecurityBootstrapService],
})
export class PlatformModule {}
