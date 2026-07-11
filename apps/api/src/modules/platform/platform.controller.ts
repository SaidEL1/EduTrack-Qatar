import { Body, Controller, Get, Headers, Param, Post, Put } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CORRELATION_ID_HEADER } from '../../common/middleware/correlation-id.middleware.js';
import { TENANT_ID_HEADER } from '../../common/middleware/tenant-context.middleware.js';
import { RequirePermission } from '../security/decorators/require-permission.decorator.js';
import { PLATFORM_PERMISSIONS } from '../security/permissions/platform.permissions.js';

import {
  CreateAcademicYearDto,
  CreateCampusDto,
  CreateTenantDto,
  UpsertFeatureFlagDto,
  UpsertSchoolDto,
  UpsertSettingDto,
} from './dto/platform.dto.js';
import { PlatformService } from './platform.service.js';

@ApiTags('Platform')
@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Post('tenants')
  @ApiOperation({ summary: 'Provision tenant (operator)' })
  createTenant(
    @Body() body: CreateTenantDto,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.platformService.createTenant(body, correlationId);
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List tenants (operator — Sprint 1 internal)' })
  listTenants() {
    return this.platformService.listTenants();
  }

  @Get('tenants/:tenantId')
  @RequirePermission(PLATFORM_PERMISSIONS.TENANT_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  getTenant(@Param('tenantId') tenantId: string) {
    return this.platformService.getTenant(tenantId);
  }

  @Put('school')
  @RequirePermission(PLATFORM_PERMISSIONS.SCHOOL_WRITE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  @ApiOperation({ summary: 'Create or update school profile (FR-SET-004)' })
  upsertSchool(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Body() body: UpsertSchoolDto,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.platformService.upsertSchool(
      {
        tenantId,
        name: body.name,
        ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
        ...(body.contactEmail !== undefined ? { contactEmail: body.contactEmail } : {}),
      },
      correlationId,
    );
  }

  @Get('school')
  @RequirePermission(PLATFORM_PERMISSIONS.SCHOOL_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  getSchool(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.platformService.getSchool(tenantId);
  }

  @Post('campuses')
  @RequirePermission(PLATFORM_PERMISSIONS.CAMPUS_WRITE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  @ApiOperation({ summary: 'Create campus (FR-SET-007)' })
  createCampus(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Body() body: CreateCampusDto,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.platformService.createCampus(
      {
        tenantId,
        schoolId: body.schoolId,
        name: body.name,
        code: body.code,
      },
      correlationId,
    );
  }

  @Get('campuses')
  @RequirePermission(PLATFORM_PERMISSIONS.CAMPUS_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  listCampuses(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.platformService.listCampuses(tenantId);
  }

  @Post('academic-years')
  @RequirePermission(PLATFORM_PERMISSIONS.ACADEMIC_YEAR_WRITE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  @ApiOperation({ summary: 'Configure academic year and terms (FR-SET-001)' })
  createAcademicYear(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Body() body: CreateAcademicYearDto,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.platformService.createAcademicYear(
      {
        tenantId,
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        ...(body.isCurrent !== undefined ? { isCurrent: body.isCurrent } : {}),
        ...(body.terms
          ? {
              terms: body.terms.map((term) => ({
                name: term.name,
                startDate: new Date(term.startDate),
                endDate: new Date(term.endDate),
                ...(term.sortOrder !== undefined ? { sortOrder: term.sortOrder } : {}),
              })),
            }
          : {}),
      },
      correlationId,
    );
  }

  @Get('academic-years')
  @RequirePermission(PLATFORM_PERMISSIONS.ACADEMIC_YEAR_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  listAcademicYears(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.platformService.listAcademicYears(tenantId);
  }

  @Get('academic-years/current')
  @RequirePermission(PLATFORM_PERMISSIONS.ACADEMIC_YEAR_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  getCurrentAcademicYear(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.platformService.getCurrentAcademicYear(tenantId);
  }

  @Get('settings')
  @RequirePermission(PLATFORM_PERMISSIONS.SETTINGS_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  listSettings(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.platformService.listSettings(tenantId);
  }

  @Put('settings')
  @RequirePermission(PLATFORM_PERMISSIONS.SETTINGS_WRITE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  upsertSetting(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Body() body: UpsertSettingDto,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.platformService.upsertSetting(
      tenantId,
      body.key,
      body.value,
      correlationId,
    );
  }

  @Get('feature-flags')
  @RequirePermission(PLATFORM_PERMISSIONS.FEATURE_FLAG_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  listFeatureFlags(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.platformService.listFeatureFlags(tenantId);
  }

  @Put('feature-flags')
  @RequirePermission(PLATFORM_PERMISSIONS.FEATURE_FLAG_WRITE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  upsertFeatureFlag(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Body() body: UpsertFeatureFlagDto,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.platformService.upsertFeatureFlag(
      tenantId,
      body.key,
      body.enabled,
      correlationId,
    );
  }
}
