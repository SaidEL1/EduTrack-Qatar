import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { sql } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDb } from '../../database/database.module.js';
import { Public } from '../security/decorators/public.decorator.js';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Aggregate health check' })
  check() {
    return this.health.check([() => this.databasePing()]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe (database connectivity)' })
  ready() {
    return this.health.check([() => this.databasePing()]);
  }

  private async databasePing(): Promise<HealthIndicatorResult> {
    await this.db.execute(sql`select 1`);
    return { database: { status: 'up' } };
  }
}
