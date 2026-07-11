import { Inject, Injectable } from '@nestjs/common';

import { definedFields } from '../../../common/utils/defined-fields.js';
import {
  EMAIL_PROVIDER,
  type EmailProvider,
  type EmailTemplateKey,
} from '../domain/email.types.js';
import { EmailOutboxRepository } from '../infrastructure/email-outbox.repository.js';

import { EmailTemplateService } from './email-template.service.js';

const RETRY_DELAY_SECONDS = 60;

@Injectable()
export class EmailDispatchService {
  constructor(
    private readonly outboxRepository: EmailOutboxRepository,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
  ) {}

  async processPending(limit = 10): Promise<number> {
    const pending = await this.outboxRepository.claimPending(limit);
    let processed = 0;

    for (const message of pending) {
      await this.outboxRepository.markProcessing(message.id);
      const result = await this.emailProvider.send({
        to: message.recipientEmail,
        subject: message.subject,
        bodyText: message.bodyText,
        ...(message.bodyHtml != null ? { bodyHtml: message.bodyHtml } : {}),
      });

      if (result.success) {
        await this.outboxRepository.markSent(message.id);
      } else {
        await this.outboxRepository.markFailed(
          message.id,
          result.error ?? 'send failed',
          message.attempts,
          message.maxAttempts,
          RETRY_DELAY_SECONDS,
        );
      }
      processed += 1;
    }

    return processed;
  }
}

export interface QueueEmailInput {
  readonly tenantId?: string;
  readonly templateKey: EmailTemplateKey;
  readonly recipientEmail: string;
  readonly variables: Record<string, string>;
  readonly metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly outboxRepository: EmailOutboxRepository,
    private readonly templateService: EmailTemplateService,
    private readonly dispatchService: EmailDispatchService,
  ) {}

  async queueEmail(
    input: QueueEmailInput,
  ): Promise<{ queued: true; outboxId: string }> {
    const rendered = this.templateService.render(input.templateKey, input.variables);
    const outboxId = await this.outboxRepository.enqueue({
      templateKey: input.templateKey,
      recipientEmail: input.recipientEmail,
      subject: rendered.subject,
      bodyText: rendered.bodyText,
      bodyHtml: rendered.bodyHtml,
      ...definedFields({ tenantId: input.tenantId, metadata: input.metadata }),
    });

    void this.dispatchService.processPending(1);
    return { queued: true, outboxId };
  }
}
