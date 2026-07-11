import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { PermissionGuard } from '../../src/modules/security/guards/permission.guard.js';
import { PermissionEngine } from '../../src/modules/security/permission-engine.service.js';
import { PLATFORM_PERMISSIONS } from '../../src/modules/security/permissions/platform.permissions.js';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let permissionEngine: jest.Mocked<Pick<PermissionEngine, 'assertPermission'>>;

  beforeEach(async () => {
    permissionEngine = { assertPermission: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        Reflector,
        { provide: PermissionEngine, useValue: permissionEngine },
      ],
    }).compile();

    guard = module.get(PermissionGuard);
  });

  it('allows routes without permission metadata', async () => {
    const reflector = guard.reflector;
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'x-tenant-id': 'tenant-1' } }),
      }),
    };

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(permissionEngine.assertPermission).not.toHaveBeenCalled();
  });

  it('delegates to permission engine when metadata present', async () => {
    const reflector = guard.reflector;
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(PLATFORM_PERMISSIONS.SCHOOL_READ);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-tenant-id': 'tenant-1', 'x-actor-id': 'user-1' },
        }),
      }),
    };

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(permissionEngine.assertPermission).toHaveBeenCalledWith(
      'tenant-1',
      PLATFORM_PERMISSIONS.SCHOOL_READ,
      'user-1',
    );
  });
});
