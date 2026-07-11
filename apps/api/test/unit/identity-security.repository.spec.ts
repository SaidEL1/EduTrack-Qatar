import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import {
  InvitationRepository,
  PasswordHistoryRepository,
  SecurityTokenRepository,
  UserMfaRepository,
  UserSessionRepository,
} from '../../src/modules/identity/infrastructure/identity-security.repository.js';

describe('Identity security repositories', () => {
  let db: {
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    db = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  });

  async function createModule<T>(
    RepositoryClass: new (...args: never[]) => T,
  ): Promise<T> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepositoryClass, { provide: DRIZZLE, useValue: db }],
    }).compile();
    return module.get(RepositoryClass);
  }

  describe('UserMfaRepository', () => {
    it('inserts pending MFA record', async () => {
      const repository = await createModule(UserMfaRepository);
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'mfa-1' }]),
        }),
      });

      const id = await repository.upsertPending({
        userId: 'user-1',
        secretEncrypted: 'enc',
      });
      expect(id).toBe('mfa-1');
    });

    it('updates existing pending MFA record', async () => {
      const repository = await createModule(UserMfaRepository);
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 'mfa-1' }]),
        }),
      });
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn() }),
      });

      const id = await repository.upsertPending({
        userId: 'user-1',
        secretEncrypted: 'enc2',
      });
      expect(id).toBe('mfa-1');
      expect(db.update).toHaveBeenCalled();
    });

    it('enables MFA and removes record', async () => {
      const repository = await createModule(UserMfaRepository);
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn() }),
      });
      db.delete.mockReturnValue({ where: jest.fn() });

      await repository.enable('user-1', ['hash']);
      await repository.updateBackupCodes('user-1', ['hash2']);
      await repository.remove('user-1');

      expect(db.update).toHaveBeenCalled();
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe('SecurityTokenRepository', () => {
    it('creates and consumes token', async () => {
      const repository = await createModule(SecurityTokenRepository);
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'token-1' }]),
        }),
      });
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest
            .fn()
            .mockResolvedValue([
              { id: 'token-1', userId: 'user-1', purpose: 'email_verification' },
            ]),
        }),
      });
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn() }),
      });

      const id = await repository.create({
        userId: 'user-1',
        purpose: 'email_verification',
        rawToken: 'raw',
        expiresAt: new Date(Date.now() + 60_000),
      });
      expect(id).toBe('token-1');

      const consumed = await repository.consume('raw', 'email_verification');
      expect(consumed?.userId).toBe('user-1');
    });
  });

  describe('PasswordHistoryRepository', () => {
    it('adds password hash and trims stale entries', async () => {
      const repository = await createModule(PasswordHistoryRepository);
      db.insert.mockReturnValue({ values: jest.fn() });
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest
              .fn()
              .mockResolvedValue([
                { id: '1' },
                { id: '2' },
                { id: '3' },
                { id: '4' },
                { id: '5' },
                { id: '6' },
              ]),
          }),
        }),
      });
      db.delete.mockReturnValue({ where: jest.fn() });

      await repository.add('user-1', 'hash');
      expect(db.delete).toHaveBeenCalled();
    });

    it('lists recent password hashes', async () => {
      const repository = await createModule(PasswordHistoryRepository);
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ passwordHash: 'hash-1' }]),
            }),
          }),
        }),
      });

      const hashes = await repository.listHashes('user-1');
      expect(hashes).toEqual(['hash-1']);
    });
  });

  describe('UserSessionRepository', () => {
    it('inserts new session', async () => {
      const repository = await createModule(UserSessionRepository);
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      db.insert.mockReturnValue({ values: jest.fn() });

      await repository.upsert({
        userId: 'user-1',
        tenantId: 'tenant-1',
        familyId: 'family-1',
      });
      expect(db.insert).toHaveBeenCalled();
    });

    it('updates existing session on upsert', async () => {
      const repository = await createModule(UserSessionRepository);
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 'session-1' }]),
        }),
      });
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn() }),
      });

      await repository.upsert({
        userId: 'user-1',
        tenantId: 'tenant-1',
        familyId: 'family-1',
      });
      expect(db.update).toHaveBeenCalled();
    });

    it('revokes session and all sessions', async () => {
      const repository = await createModule(UserSessionRepository);
      db.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest
              .fn()
              .mockResolvedValue([{ id: 'session-1', familyId: 'family-1' }]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([{ familyId: 'family-1' }]),
            }),
          }),
        });
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn() }),
      });

      const familyId = await repository.revoke('session-1', 'user-1');
      expect(familyId).toBe('family-1');

      const familyIds = await repository.revokeAll('user-1', 'tenant-1');
      expect(familyIds).toEqual(['family-1']);
    });
  });

  describe('InvitationRepository', () => {
    it('creates, finds, lists, and accepts invitations', async () => {
      const repository = await createModule(InvitationRepository);
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'inv-1', email: 'a@test.qa' }]),
        }),
      });
      db.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ id: 'inv-1' }]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([{ id: 'inv-1' }]),
            }),
          }),
        });
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn() }),
      });

      const created = await repository.create({
        tenantId: 'tenant-1',
        email: 'A@Test.QA',
        invitedBy: 'admin-1',
        rawToken: 'token',
        expiresAt: new Date(Date.now() + 60_000),
      });
      expect(created?.email).toBe('a@test.qa');

      const found = await repository.findByToken('token');
      expect(found?.id).toBe('inv-1');

      const list = await repository.listByTenant('tenant-1');
      expect(list).toHaveLength(1);

      await repository.markAccepted('inv-1', 'user-1');
      expect(db.update).toHaveBeenCalled();
    });
  });
});
