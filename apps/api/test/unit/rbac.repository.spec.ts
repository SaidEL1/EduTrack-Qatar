import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { PermissionCacheService } from '../../src/modules/identity/infrastructure/permission-cache.service.js';
import { RbacRepository } from '../../src/modules/identity/infrastructure/rbac.repository.js';

describe('RbacRepository', () => {
  let repository: RbacRepository;
  let db: {
    select: jest.Mock;
    insert: jest.Mock;
    delete: jest.Mock;
  };
  let permissionCache: jest.Mocked<
    Pick<PermissionCacheService, 'get' | 'set' | 'invalidate'>
  >;

  beforeEach(async () => {
    db = {
      select: jest.fn(),
      insert: jest.fn(),
      delete: jest.fn(),
    };

    permissionCache = {
      get: jest.fn(),
      set: jest.fn(),
      invalidate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacRepository,
        { provide: DRIZZLE, useValue: db },
        { provide: PermissionCacheService, useValue: permissionCache },
      ],
    }).compile();

    repository = module.get(RbacRepository);
  });

  it('returns cached permissions when available', async () => {
    permissionCache.get.mockResolvedValue(['platform.school.read']);

    const permissions = await repository.resolvePermissions('tenant-1', 'user-1');
    expect(permissions).toEqual(['platform.school.read']);
    expect(db.select).not.toHaveBeenCalled();
  });

  it('resolves permissions from database and caches result', async () => {
    permissionCache.get.mockResolvedValue(undefined);

    db.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ roleId: 'role-1' }]),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ code: 'platform.school.read' }]),
          }),
        }),
      });

    const permissions = await repository.resolvePermissions('tenant-1', 'user-1');
    expect(permissions).toEqual(['platform.school.read']);
    expect(permissionCache.set).toHaveBeenCalledWith('tenant-1', 'user-1', [
      'platform.school.read',
    ]);
  });

  it('bootstraps tenant admin role when missing', async () => {
    db.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest
            .fn()
            .mockResolvedValue([{ id: 'perm-1', code: 'platform.school.read' }]),
        }),
      });

    db.insert
      .mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'role-1' }]),
        }),
      })
      .mockReturnValueOnce({ values: jest.fn().mockResolvedValue(undefined) });

    const roleId = await repository.bootstrapTenantAdminRole('tenant-1', [
      'platform.school.read',
    ]);

    expect(roleId).toBe('role-1');
  });

  it('assigns role to tenant user', async () => {
    db.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
      }),
    });

    await repository.assignRole('tenant-1', 'user-1', 'role-1', 'admin-1');
    expect(permissionCache.invalidate).toHaveBeenCalledWith('tenant-1', 'user-1');
  });

  it('removes role from tenant user', async () => {
    db.delete.mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) });

    await repository.removeRole('tenant-1', 'user-1', 'role-1');
    expect(permissionCache.invalidate).toHaveBeenCalledWith('tenant-1', 'user-1');
  });

  it('lists tenant roles', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ id: 'role-1', code: 'tenant_admin' }]),
      }),
    });

    const roles = await repository.listRoles('tenant-1');
    expect(roles).toHaveLength(1);
  });
});
