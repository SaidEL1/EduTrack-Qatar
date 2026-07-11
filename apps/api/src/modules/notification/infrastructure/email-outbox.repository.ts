import { Inject, Injectable } from '@nestjs/common';
import { and, eq, lt, lte } from 'drizzle-orm';

import { definedFields } from '../../../common/utils/defined-fields.js';
import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import { emailOutbox } from '../../../database/schema/index.js';

export interface EnqueueEmailInput {
  readonly tenantId?: string;
  readonly templateKey: string;
  readonly recipientEmail: string;
  readonly subject: string;
  readonly bodyText: string;
  readonly bodyHtml?: string;
  readonly metadata?: Record<string, unknown>;
}

@Injectable()
export class EmailOutboxRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async enqueue(input: EnqueueEmailInput): Promise<string> {
    const [row] = await this.db
      .insert(emailOutbox)
      .values({
        templateKey: input.templateKey,
        recipientEmail: input.recipientEmail.toLowerCase(),
        subject: input.subject,
        bodyText: input.bodyText,
        bodyHtml: input.bodyHtml,
        metadata: input.metadata,
        ...definedFields({ tenantId: input.tenantId }),
      })
      .returning({ id: emailOutbox.id });
    return row?.id ?? '';
  }

  async claimPending(limit = 10) {
    return this.db
      .select()
      .from(emailOutbox)
      .where(
        and(
          eq(emailOutbox.status, 'pending'),
          lte(emailOutbox.scheduledAt, new Date()),
          lt(emailOutbox.attempts, emailOutbox.maxAttempts),
        ),
      )
      .limit(limit);
  }

  async markProcessing(id: string): Promise<void> {
    await this.db
      .update(emailOutbox)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(emailOutbox.id, id));
  }

  async markSent(id: string): Promise<void> {
    await this.db
      .update(emailOutbox)
      .set({
        status: 'sent',
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(emailOutbox.id, id));
  }

  async markFailed(
    id: string,
    error: string,
    attempts: number,
    maxAttempts: number,
    retryDelaySeconds: number,
  ): Promise<void> {
    if (attempts + 1 >= maxAttempts) {
      await this.markDead(id, error);
      return;
    }
    await this.db
      .update(emailOutbox)
      .set({
        status: 'pending',
        attempts: attempts + 1,
        lastError: error,
        scheduledAt: new Date(Date.now() + retryDelaySeconds * 1000),
        updatedAt: new Date(),
      })
      .where(eq(emailOutbox.id, id));
  }

  async markDead(id: string, error: string): Promise<void> {
    await this.db
      .update(emailOutbox)
      .set({
        status: 'failed',
        lastError: error,
        updatedAt: new Date(),
      })
      .where(eq(emailOutbox.id, id));
  }
}
