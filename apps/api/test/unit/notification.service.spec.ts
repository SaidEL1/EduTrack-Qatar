import { Test, type TestingModule } from '@nestjs/testing';

import { EmailTemplateService } from '../../src/modules/notification/application/email-template.service.js';
import {
  EmailDispatchService,
  NotificationService,
} from '../../src/modules/notification/application/notification.service.js';
import { EMAIL_PROVIDER } from '../../src/modules/notification/domain/email.types.js';
import { EmailOutboxRepository } from '../../src/modules/notification/infrastructure/email-outbox.repository.js';

describe('NotificationService', () => {
  let service: NotificationService;
  let outboxRepository: jest.Mocked<
    Pick<
      EmailOutboxRepository,
      'enqueue' | 'claimPending' | 'markProcessing' | 'markSent'
    >
  >;
  let emailProvider: { send: jest.Mock };

  beforeEach(async () => {
    outboxRepository = {
      enqueue: jest.fn().mockResolvedValue('outbox-1'),
      claimPending: jest.fn().mockResolvedValue([
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
      markProcessing: jest.fn(),
      markSent: jest.fn(),
    };
    emailProvider = { send: jest.fn().mockResolvedValue({ success: true }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplateService,
        EmailDispatchService,
        NotificationService,
        { provide: EmailOutboxRepository, useValue: outboxRepository },
        { provide: EMAIL_PROVIDER, useValue: emailProvider },
      ],
    }).compile();

    service = module.get(NotificationService);
  });

  it('queues password reset email', async () => {
    const result = await service.queueEmail({
      templateKey: 'password_reset',
      recipientEmail: 'user@test.qa',
      variables: { link: 'http://localhost/reset' },
    });
    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });

    expect(result.queued).toBe(true);
    expect(outboxRepository.enqueue).toHaveBeenCalled();
    expect(emailProvider.send).toHaveBeenCalled();
  });
});
