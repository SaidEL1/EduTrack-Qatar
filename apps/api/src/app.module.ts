import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor.js';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware.js';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware.js';
import { DatabaseModule } from './database/database.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { PlatformModule } from './modules/platform/platform.module.js';
import { SecurityModule } from './modules/security/security.module.js';

@Module({
  imports: [
    DatabaseModule,
    IdentityModule,
    SecurityModule,
    HealthModule,
    AuditModule,
    PlatformModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware, TenantContextMiddleware).forRoutes('*');
  }
}
