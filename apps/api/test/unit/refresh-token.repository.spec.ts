import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { RefreshTokenRepository } from '../../src/modules/identity/infrastructure/refresh-token.repository.js';

describe('RefreshTokenRepository', () => {
  let repository: RefreshTokenRepository;
  let db: {
    insert: jest.Mock;
    select: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    db = {
      insert: jest.fn(),
      select: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokenRepository, { provide: DRIZZLE, useValue: db }],
    }).compile();

    repository = module.get(RefreshTokenRepository);
  });

  it('stores refresh token hash', async () => {
    db.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'rt-1' }]),
      }),
    });

    const id = await repository.store({
      userId: 'user-1',
      tenantId: 'tenant-1',
      rawToken: 'raw-token-value',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + 60_000),
    });

    expect(id).toBe('rt-1');
  });

  it('finds valid refresh token', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ id: 'rt-1', userId: 'user-1' }]),
      }),
    });

    const row = await repository.findValid('raw-token-value');
    expect(row?.id).toBe('rt-1');
  });

  it('revokes token by id', async () => {
    db.update.mockReturnValue({
      set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
    });

    await repository.revoke('rt-1');
    expect(db.update).toHaveBeenCalled();
  });
});
