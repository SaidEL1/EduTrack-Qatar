import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDb } from '../../database/database.module.js';
import {
  academicTerms,
  academicYears,
  campuses,
  featureFlags,
  schools,
  systemSettings,
  tenants,
} from '../../database/schema/index.js';
import { AuditService } from '../audit/audit.service.js';
import { PermissionEngine } from '../security/permission-engine.service.js';
import { DEFAULT_PLATFORM_PERMISSIONS } from '../security/permissions/platform.permissions.js';

import { buildAuditEntry } from './platform-audit.helper.js';

export interface CreateTenantInput {
  readonly slug: string;
  readonly name: string;
}

export interface CreateSchoolInput {
  readonly tenantId: string;
  readonly name: string;
  readonly timezone?: string;
  readonly contactEmail?: string;
}

export interface CreateCampusInput {
  readonly tenantId: string;
  readonly schoolId: string;
  readonly name: string;
  readonly code: string;
}

export interface CreateAcademicYearInput {
  readonly tenantId: string;
  readonly name: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly isCurrent?: boolean;
  readonly terms?: readonly {
    readonly name: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly sortOrder?: string;
  }[];
}

@Injectable()
export class PlatformService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly auditService: AuditService,
    private readonly permissionEngine: PermissionEngine,
  ) {}

  async createTenant(input: CreateTenantInput, correlationId?: string) {
    const [tenant] = await this.db
      .insert(tenants)
      .values({ slug: input.slug, name: input.name, status: 'active' })
      .returning();

    if (!tenant) {
      throw new NotFoundException('Failed to create tenant');
    }

    this.permissionEngine.seedTenantPermissions(
      tenant.id,
      DEFAULT_PLATFORM_PERMISSIONS,
    );

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId: tenant.id,
          actorId: 'system',
          action: 'tenant.created',
          entityType: 'tenant',
          entityId: tenant.id,
          afterState: tenant,
        },
        correlationId,
      ),
    );

    return tenant;
  }

  async listTenants() {
    return this.db.select().from(tenants);
  }

  async getTenant(tenantId: string) {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async upsertSchool(input: CreateSchoolInput, correlationId?: string) {
    const existing = await this.db
      .select()
      .from(schools)
      .where(eq(schools.tenantId, input.tenantId));

    if (existing[0]) {
      const [updated] = await this.db
        .update(schools)
        .set({
          name: input.name,
          timezone: input.timezone ?? existing[0].timezone,
          contactEmail: input.contactEmail,
          updatedAt: new Date(),
        })
        .where(eq(schools.id, existing[0].id))
        .returning();

      await this.auditService.append(
        buildAuditEntry(
          {
            tenantId: input.tenantId,
            action: 'school.updated',
            entityType: 'school',
            entityId: updated?.id ?? existing[0].id,
            beforeState: existing[0],
            ...(updated ? { afterState: updated } : {}),
          },
          correlationId,
        ),
      );

      return updated;
    }

    const [created] = await this.db
      .insert(schools)
      .values({
        tenantId: input.tenantId,
        name: input.name,
        timezone: input.timezone ?? 'Asia/Qatar',
        contactEmail: input.contactEmail,
      })
      .returning();

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId: input.tenantId,
          action: 'school.created',
          entityType: 'school',
          entityId: created?.id ?? '',
          ...(created ? { afterState: created } : {}),
        },
        correlationId,
      ),
    );

    return created;
  }

  async getSchool(tenantId: string) {
    const [school] = await this.db
      .select()
      .from(schools)
      .where(eq(schools.tenantId, tenantId));
    if (!school) {
      throw new NotFoundException('School profile not found');
    }
    return school;
  }

  async createCampus(input: CreateCampusInput, correlationId?: string) {
    const [campus] = await this.db
      .insert(campuses)
      .values({
        tenantId: input.tenantId,
        schoolId: input.schoolId,
        name: input.name,
        code: input.code,
      })
      .returning();

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId: input.tenantId,
          action: 'campus.created',
          entityType: 'campus',
          entityId: campus?.id ?? '',
          ...(campus ? { afterState: campus } : {}),
        },
        correlationId,
      ),
    );

    return campus;
  }

  async listCampuses(tenantId: string) {
    return this.db.select().from(campuses).where(eq(campuses.tenantId, tenantId));
  }

  async createAcademicYear(input: CreateAcademicYearInput, correlationId?: string) {
    if (input.isCurrent) {
      await this.db
        .update(academicYears)
        .set({ isCurrent: false, updatedAt: new Date() })
        .where(eq(academicYears.tenantId, input.tenantId));
    }

    const [year] = await this.db
      .insert(academicYears)
      .values({
        tenantId: input.tenantId,
        name: input.name,
        startDate: input.startDate,
        endDate: input.endDate,
        isCurrent: input.isCurrent ?? false,
      })
      .returning();

    if (input.terms?.length && year) {
      await this.db.insert(academicTerms).values(
        input.terms.map((term) => ({
          tenantId: input.tenantId,
          academicYearId: year.id,
          name: term.name,
          startDate: term.startDate,
          endDate: term.endDate,
          sortOrder: term.sortOrder ?? '1',
        })),
      );
    }

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId: input.tenantId,
          action: 'academic_year.created',
          entityType: 'academic_year',
          entityId: year?.id ?? '',
          ...(year ? { afterState: year } : {}),
        },
        correlationId,
      ),
    );

    return year;
  }

  async listAcademicYears(tenantId: string) {
    return this.db
      .select()
      .from(academicYears)
      .where(eq(academicYears.tenantId, tenantId));
  }

  async getCurrentAcademicYear(tenantId: string) {
    const [year] = await this.db
      .select()
      .from(academicYears)
      .where(
        and(eq(academicYears.tenantId, tenantId), eq(academicYears.isCurrent, true)),
      );
    if (!year) {
      throw new NotFoundException('No current academic year configured');
    }
    return year;
  }

  async listSettings(tenantId: string) {
    return this.db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.tenantId, tenantId));
  }

  async upsertSetting(
    tenantId: string,
    key: string,
    value: Record<string, unknown>,
    correlationId?: string,
  ) {
    const existing = await this.db
      .select()
      .from(systemSettings)
      .where(and(eq(systemSettings.tenantId, tenantId), eq(systemSettings.key, key)));

    if (existing[0]) {
      const [updated] = await this.db
        .update(systemSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(systemSettings.id, existing[0].id))
        .returning();

      await this.auditService.append(
        buildAuditEntry(
          {
            tenantId,
            action: 'settings.updated',
            entityType: 'system_setting',
            entityId: updated?.id ?? key,
            beforeState: existing[0],
            ...(updated ? { afterState: updated } : {}),
          },
          correlationId,
        ),
      );

      return updated;
    }

    const [created] = await this.db
      .insert(systemSettings)
      .values({ tenantId, key, value })
      .returning();

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId,
          action: 'settings.created',
          entityType: 'system_setting',
          entityId: created?.id ?? key,
          ...(created ? { afterState: created } : {}),
        },
        correlationId,
      ),
    );

    return created;
  }

  async listFeatureFlags(tenantId: string) {
    return this.db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.tenantId, tenantId));
  }

  async upsertFeatureFlag(
    tenantId: string,
    key: string,
    enabled: boolean,
    correlationId?: string,
  ) {
    const existing = await this.db
      .select()
      .from(featureFlags)
      .where(and(eq(featureFlags.tenantId, tenantId), eq(featureFlags.key, key)));

    if (existing[0]) {
      const [updated] = await this.db
        .update(featureFlags)
        .set({ enabled, updatedAt: new Date() })
        .where(eq(featureFlags.id, existing[0].id))
        .returning();

      await this.auditService.append(
        buildAuditEntry(
          {
            tenantId,
            action: 'feature_flag.updated',
            entityType: 'feature_flag',
            entityId: updated?.id ?? key,
            beforeState: existing[0],
            ...(updated ? { afterState: updated } : {}),
          },
          correlationId,
        ),
      );

      return updated;
    }

    const [created] = await this.db
      .insert(featureFlags)
      .values({ tenantId, key, enabled })
      .returning();

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId,
          action: 'feature_flag.created',
          entityType: 'feature_flag',
          entityId: created?.id ?? key,
          ...(created ? { afterState: created } : {}),
        },
        correlationId,
      ),
    );

    return created;
  }
}
