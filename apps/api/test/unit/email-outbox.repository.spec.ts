import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { EmailOutboxRepository } from '../../src/modules/notification/infrastructure/email-outbox.repository.js';

describe('EmailOutboxRepository', () => {
  let repository: EmailOutboxRepository;
  let db: {
    insert: jest.Mock;
    select: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    db = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'outbox-1' }]),
        }),
      }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                id: 'outbox-1',
                recipientEmail: 'user@test.qa',
                subject: 'Test',
                bodyText: 'Body',
                bodyHtml: null,
                attempts: 0,
                maxAttempts: 5,
              },
            ]),
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailOutboxRepository, { provide: DRIZZLE, useValue: db }],
    }).compile();

    repository = module.get(EmailOutboxRepository);
  });

  it('enqueues email messages', async () => {
    const id = await repository.enqueue({
      templateKey: 'password_reset',
      recipientEmail: 'User@Test.QA',
      subject: 'Reset',
      bodyText: 'Body',
    });
    expect(id).toBe('outbox-1');
  });

  it('claims pending messages', async () => {
    const pending = await repository.claimPending(5);
    expect(pending).toHaveLength(1);
  });

  it('marks messages sent and failed with retry scheduling', async () => {
    await repository.markProcessing('outbox-1');
    await repository.markSent('outbox-1');
    await repository.markFailed('outbox-1', 'smtp down', 1, 5, 60);
    expect(db.update).toHaveBeenCalled();
  });
});
