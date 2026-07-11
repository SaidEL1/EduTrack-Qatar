import { Injectable } from '@nestjs/common';

import type { EmailTemplateKey, RenderedEmail } from '../domain/email.types.js';

const APP_NAME = 'EduTrack Qatar';

@Injectable()
export class EmailTemplateService {
  render(
    templateKey: EmailTemplateKey,
    variables: Record<string, string>,
  ): RenderedEmail {
    switch (templateKey) {
      case 'email_verification':
        return this.emailVerification(variables);
      case 'password_reset':
        return this.passwordReset(variables);
      case 'user_invitation':
        return this.userInvitation(variables);
      default:
        throw new Error(`Unknown email template: ${String(templateKey)}`);
    }
  }

  private emailVerification(variables: Record<string, string>): RenderedEmail {
    const link = variables['link'] ?? '';
    return {
      subject: `${APP_NAME} — Verify your email`,
      bodyText: `Verify your email address by opening: ${link}`,
      bodyHtml: `<p>Verify your email address for ${APP_NAME}.</p><p><a href="${link}">Verify email</a></p>`,
    };
  }

  private passwordReset(variables: Record<string, string>): RenderedEmail {
    const link = variables['link'] ?? '';
    return {
      subject: `${APP_NAME} — Reset your password`,
      bodyText: `Reset your password by opening: ${link}`,
      bodyHtml: `<p>Reset your ${APP_NAME} password.</p><p><a href="${link}">Reset password</a></p>`,
    };
  }

  private userInvitation(variables: Record<string, string>): RenderedEmail {
    const link = variables['link'] ?? '';
    const tenantName = variables['tenantName'] ?? 'your organization';
    return {
      subject: `${APP_NAME} — You're invited to ${tenantName}`,
      bodyText: `Accept your invitation: ${link}`,
      bodyHtml: `<p>You have been invited to join ${tenantName} on ${APP_NAME}.</p><p><a href="${link}">Accept invitation</a></p>`,
    };
  }
}
