import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import {
  LoginEventRepository,
  MfaLoginChallengeRepository,
  SecurityEventRepository,
} from '../../src/modules/identity/infrastructure/security-event.repository.js';

describe('Security event repositories', () => {
  let db: {
    insert: jest.Mock;
    select: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(() => {
    db = {
      insert: jest.fn().mockReturnValue({ values: jest.fn() }),
      select: jest.fn(),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn() }),
      }),
    };
  });

  it('records and lists login events', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginEventRepository, { provide: DRIZZLE, useValue: db }],
    }).compile();
    const repository = module.get(LoginEventRepository);

    await repository.record({
      tenantId: 'tenant-1',
      email: 'user@test.qa',
      outcome: 'success',
    });

    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 'event-1' }]),
          }),
        }),
      }),
    });

    const events = await repository.listByTenant('tenant-1');
    expect(events).toHaveLength(1);
  });

  it('records and lists security events', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityEventRepository, { provide: DRIZZLE, useValue: db }],
    }).compile();
    const repository = module.get(SecurityEventRepository);

    await repository.record({
      userId: 'user-1',
      eventType: 'auth.refresh_token.reuse',
      severity: 'critical',
    });

    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 'sec-1' }]),
          }),
        }),
      }),
    });

    const events = await repository.listByTenant('tenant-1');
    expect(events).toHaveLength(1);
  });

  it('creates and consumes MFA login challenges', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MfaLoginChallengeRepository, { provide: DRIZZLE, useValue: db }],
    }).compile();
    const repository = module.get(MfaLoginChallengeRepository);

    db.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'challenge-1' }]),
      }),
    });

    const id = await repository.create({
      userId: 'user-1',
      tenantId: 'tenant-1',
      rawToken: 'raw',
      expiresAt: new Date(Date.now() + 60_000),
    });
    expect(id).toBe('challenge-1');

    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockResolvedValue([
            { id: 'challenge-1', userId: 'user-1', tenantId: 'tenant-1' },
          ]),
      }),
    });

    const consumed = await repository.consume('raw');
    expect(consumed?.userId).toBe('user-1');
  });
});
