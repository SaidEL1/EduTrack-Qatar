import { Test, type TestingModule } from '@nestjs/testing';

import { RbacRepository } from '../../src/modules/identity/infrastructure/rbac.repository.js';
import { PermissionEngine } from '../../src/modules/security/permission-engine.service.js';
import { PLATFORM_PERMISSIONS } from '../../src/modules/security/permissions/platform.permissions.js';

describe('PermissionEngine', () => {
  let engine: PermissionEngine;
  let rbacRepository: jest.Mocked<Pick<RbacRepository, 'resolvePermissions'>>;

  beforeEach(async () => {
    rbacRepository = {
      resolvePermissions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionEngine,
        { provide: RbacRepository, useValue: rbacRepository },
      ],
    }).compile();

    engine = module.get(PermissionEngine);
  });

  it('allows system actor without DB lookup', async () => {
    await expect(
      engine.assertPermission('tenant-1', PLATFORM_PERMISSIONS.SCHOOL_READ, 'system'),
    ).resolves.toBeUndefined();
    expect(rbacRepository.resolvePermissions).not.toHaveBeenCalled();
  });

  it('denies when permission not granted', async () => {
    rbacRepository.resolvePermissions.mockResolvedValue([]);

    await expect(
      engine.assertPermission('tenant-1', PLATFORM_PERMISSIONS.SCHOOL_READ, 'user-1'),
    ).rejects.toThrow('Missing permission');
  });

  it('allows when permission resolved from RBAC', async () => {
    rbacRepository.resolvePermissions.mockResolvedValue([
      PLATFORM_PERMISSIONS.SCHOOL_READ,
    ]);

    await expect(
      engine.assertPermission('tenant-1', PLATFORM_PERMISSIONS.SCHOOL_READ, 'user-1'),
    ).resolves.toBeUndefined();
  });

  it('denies when actor id missing', async () => {
    await expect(
      engine.assertPermission('tenant-1', PLATFORM_PERMISSIONS.SCHOOL_READ),
    ).rejects.toThrow('Missing permission');
  });

  it('checks hasPermission helper', async () => {
    rbacRepository.resolvePermissions.mockResolvedValue([
      PLATFORM_PERMISSIONS.SCHOOL_READ,
    ]);
    await expect(
      engine.hasPermission('tenant-1', PLATFORM_PERMISSIONS.SCHOOL_READ, 'user-1'),
    ).resolves.toBe(true);
  });
});
