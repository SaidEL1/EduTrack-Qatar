import { createLogger } from '@edutrack/logging';
import { Injectable } from '@nestjs/common';

import type {
  EmailProvider,
  EmailSendInput,
  EmailSendResult,
} from '../domain/email.types.js';

/** Development email provider — logs payloads without external delivery */
@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  private readonly logger = createLogger({
    prettyPrint: process.env['NODE_ENV'] === 'development',
    baseContext: {
      service: process.env['SERVICE_NAME'] ?? 'edutrack-api',
      environment: process.env['NODE_ENV'] ?? 'test',
      module: 'ConsoleEmailProvider',
    },
  });

  send(input: EmailSendInput): Promise<EmailSendResult> {
    this.logger.info(
      { to: input.to, subject: input.subject },
      'Email dispatched (console provider)',
    );
    return Promise.resolve({ success: true });
  }
}
