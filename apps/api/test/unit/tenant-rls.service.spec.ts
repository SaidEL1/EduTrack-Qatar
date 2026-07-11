import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { TenantRlsService } from '../../src/modules/identity/infrastructure/tenant-rls.service.js';

describe('TenantRlsService', () => {
  let service: TenantRlsService;
  let transactionFn: jest.Mock;
  let db: { transaction: jest.Mock; execute: jest.Mock };

  beforeEach(async () => {
    transactionFn = jest.fn((callback: (tx: typeof db) => unknown) => callback(db));
    db = {
      transaction: transactionFn,
      execute: jest.fn().mockResolvedValue([{ count: 3 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantRlsService, { provide: DRIZZLE, useValue: db }],
    }).compile();

    service = module.get(TenantRlsService);
  });

  it('sets tenant context inside transaction', async () => {
    transactionFn.mockImplementation(
      (callback: (tx: { execute: jest.Mock }) => unknown) =>
        callback({
          execute: jest.fn().mockResolvedValue([]),
        }),
    );

    const result = await service.runInTenantContext('tenant-1', () =>
      Promise.resolve('ok'),
    );
    expect(result).toBe('ok');
    expect(transactionFn).toHaveBeenCalled();
  });

  it('compares tenant isolation counts', async () => {
    db.execute
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ count: 5 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ count: 2 }]);

    const result = await service.verifyTenantIsolation(
      'tenant-1',
      'tenant-2',
      'user_sessions',
    );

    expect(result).toEqual({ ownCount: 5, otherCount: 2 });
  });
});
