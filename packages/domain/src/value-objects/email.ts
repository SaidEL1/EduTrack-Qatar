import { err, ok, type Result } from '@edutrack/shared';

import { ValueObject } from '../base/value-object.js';
import { DomainError } from '../errors/domain-error.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EmailProps {
  readonly value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  static create(raw: string): Result<Email, DomainError> {
    const normalized = raw.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      return err(new DomainError('Invalid email address', { value: raw }));
    }
    return ok(new Email({ value: normalized }));
  }

  get value(): string {
    return this.props.value;
  }

  override toString(): string {
    return this.props.value;
  }
}
