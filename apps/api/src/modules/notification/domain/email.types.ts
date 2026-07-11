export type EmailTemplateKey =
  'email_verification' | 'password_reset' | 'user_invitation';

export interface RenderedEmail {
  readonly subject: string;
  readonly bodyText: string;
  readonly bodyHtml: string;
}

export interface EmailSendInput {
  readonly to: string;
  readonly subject: string;
  readonly bodyText: string;
  readonly bodyHtml?: string;
}

export interface EmailSendResult {
  readonly success: boolean;
  readonly error?: string;
}

/** Pluggable email transport — Sprint 2C */
export interface EmailProvider {
  send(input: EmailSendInput): Promise<EmailSendResult>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
