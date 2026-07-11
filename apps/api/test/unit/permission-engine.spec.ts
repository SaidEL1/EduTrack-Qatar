import { Test, type TestingModule } from '@nestjs/testing';

import { PermissionEngine } from '../../src/modules/security/permission-engine.service.js';
import { PLATFORM_PERMISSIONS } from '../../src/modules/security/permissions/platform.permissions.js';

describe('PermissionEngine', () => {
  let engine: PermissionEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionEngine],
    }).compile();

    engine = module.get(PermissionEngine);
  });

  it('allows system actor without seeded permissions', () => {
    expect(() => {
      engine.assertPermission('tenant-1', PLATFORM_PERMISSIONS.SCHOOL_READ, 'system');
    }).not.toThrow();
  });

  it('denies when permission not seeded', () => {
    expect(() => {
      engine.assertPermission('tenant-1', PLATFORM_PERMISSIONS.SCHOOL_READ);
    }).toThrow('Missing permission');
  });

  it('allows when permission seeded for tenant', () => {
    engine.seedTenantPermissions('tenant-1', [PLATFORM_PERMISSIONS.SCHOOL_READ]);
    expect(() => {
      engine.assertPermission('tenant-1', PLATFORM_PERMISSIONS.SCHOOL_READ);
    }).not.toThrow();
  });
});
