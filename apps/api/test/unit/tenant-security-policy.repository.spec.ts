import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { TenantSecurityPolicyRepository } from '../../src/modules/identity/infrastructure/tenant-security-policy.repository.js';

describe('TenantSecurityPolicyRepository', () => {
  let repository: TenantSecurityPolicyRepository;
  let db: {
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    db = {
      select: jest.fn(),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              tenantId: 'tenant-1',
              mfaRequired: false,
              passwordMinLength: 12,
              passwordExpiryDays: 90,
              passwordHistoryCount: 5,
              maxActiveSessions: 10,
              sessionIdleTimeoutMinutes: 480,
            },
          ]),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              {
                tenantId: 'tenant-1',
                mfaRequired: true,
                passwordMinLength: 14,
                passwordExpiryDays: 90,
                passwordHistoryCount: 5,
                maxActiveSessions: 5,
                sessionIdleTimeoutMinutes: 240,
              },
            ]),
          }),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantSecurityPolicyRepository, { provide: DRIZZLE, useValue: db }],
    }).compile();

    repository = module.get(TenantSecurityPolicyRepository);
  });

  it('creates default policy for tenant', async () => {
    const policy = await repository.createDefaults('tenant-1');
    expect(policy.tenantId).toBe('tenant-1');
    expect(policy.passwordMinLength).toBe(12);
  });

  it('returns null when policy is missing', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    await expect(repository.findByTenantId('tenant-1')).resolves.toBeNull();
  });

  it('upserts policy values', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([
          {
            tenantId: 'tenant-1',
            mfaRequired: false,
            passwordMinLength: 12,
            passwordExpiryDays: 90,
            passwordHistoryCount: 5,
            maxActiveSessions: 10,
            sessionIdleTimeoutMinutes: 480,
          },
        ]),
      }),
    });

    const updated = await repository.upsert('tenant-1', {
      mfaRequired: true,
      maxActiveSessions: 5,
    });
    expect(updated.mfaRequired).toBe(true);
    expect(updated.maxActiveSessions).toBe(5);
  });
});
