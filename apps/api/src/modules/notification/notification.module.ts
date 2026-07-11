import { Module } from '@nestjs/common';

import { EmailTemplateService } from './application/email-template.service.js';
import {
  EmailDispatchService,
  NotificationService,
} from './application/notification.service.js';
import { EMAIL_PROVIDER } from './domain/email.types.js';
import { ConsoleEmailProvider } from './infrastructure/console-email.provider.js';
import { EmailOutboxRepository } from './infrastructure/email-outbox.repository.js';

@Module({
  providers: [
    EmailTemplateService,
    EmailOutboxRepository,
    EmailDispatchService,
    NotificationService,
    ConsoleEmailProvider,
    { provide: EMAIL_PROVIDER, useExisting: ConsoleEmailProvider },
  ],
  exports: [NotificationService, EmailDispatchService],
})
export class NotificationModule {}
