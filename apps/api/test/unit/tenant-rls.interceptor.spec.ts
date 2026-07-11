import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { TenantRlsInterceptor } from '../../src/common/interceptors/tenant-rls.interceptor.js';
import { TenantRlsService } from '../../src/modules/identity/infrastructure/tenant-rls.service.js';

describe('TenantRlsInterceptor', () => {
  let interceptor: TenantRlsInterceptor;
  let tenantRlsService: jest.Mocked<Pick<TenantRlsService, 'runInTenantContext'>>;

  beforeEach(async () => {
    tenantRlsService = {
      runInTenantContext: jest.fn((_tenantId, fn) => fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantRlsInterceptor,
        Reflector,
        { provide: TenantRlsService, useValue: tenantRlsService },
      ],
    }).compile();

    interceptor = module.get(TenantRlsInterceptor);
  });

  function createContext(request: { headers: Record<string, string> }) {
    return {
      getType: () => 'http',
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    };
  }

  it('wraps tenant-scoped requests in RLS context', async () => {
    const request = {
      headers: { 'x-tenant-id': 'tenant-1' },
    };

    const result = await firstValueFrom(
      interceptor.intercept(createContext(request) as never, {
        handle: () => of({ ok: true }),
      }),
    );

    expect(result).toEqual({ ok: true });
    expect(tenantRlsService.runInTenantContext).toHaveBeenCalledWith(
      'tenant-1',
      expect.any(Function),
    );
  });

  it('passes through when tenant header is missing', async () => {
    const request = { headers: {} };

    await firstValueFrom(
      interceptor.intercept(createContext(request) as never, {
        handle: () => of({ ok: true }),
      }),
    );
    expect(tenantRlsService.runInTenantContext).not.toHaveBeenCalled();
  });
});
