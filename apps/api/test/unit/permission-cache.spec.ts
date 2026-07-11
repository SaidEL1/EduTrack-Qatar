import { PermissionCacheService } from '../../src/modules/identity/infrastructure/permission-cache.service.js';

describe('PermissionCacheService', () => {
  it('stores and retrieves permissions in memory fallback', async () => {
    const cache = new PermissionCacheService(undefined);

    await cache.set('tenant-1', 'user-1', ['platform.school.read']);
    const permissions = await cache.get('tenant-1', 'user-1');

    expect(permissions).toEqual(['platform.school.read']);
  });

  it('invalidates cached permissions', async () => {
    const cache = new PermissionCacheService(undefined);

    await cache.set('tenant-1', 'user-1', ['platform.school.read']);
    await cache.invalidate('tenant-1', 'user-1');

    expect(await cache.get('tenant-1', 'user-1')).toBeUndefined();
  });

  it('invalidates all tenant cache entries', async () => {
    const cache = new PermissionCacheService(undefined);

    await cache.set('tenant-1', 'user-1', ['a']);
    await cache.set('tenant-1', 'user-2', ['b']);
    await cache.invalidateTenant('tenant-1');

    expect(await cache.get('tenant-1', 'user-1')).toBeUndefined();
    expect(await cache.get('tenant-1', 'user-2')).toBeUndefined();
  });
});
