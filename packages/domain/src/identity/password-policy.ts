import { err, ok, type Result } from '@edutrack/shared';

import { DomainError } from '../errors/domain-error.js';

/** NFR-SEC-004 — minimum 12 chars with complexity */
const MIN_LENGTH = 12;
const UPPERCASE = /[A-Z]/;
const LOWERCASE = /[a-z]/;
const DIGIT = /\d/;
const SPECIAL = /[^A-Za-z0-9]/;

export interface PasswordPolicyOptions {
  readonly minLength?: number;
}

export function validatePasswordPolicy(
  password: string,
  options: PasswordPolicyOptions = {},
): Result<string, DomainError> {
  const minLength = options.minLength ?? MIN_LENGTH;

  if (password.length < minLength) {
    return err(
      new DomainError(`Password must be at least ${String(minLength)} characters`, {
        code: 'PASSWORD_TOO_SHORT',
      }),
    );
  }

  if (!UPPERCASE.test(password)) {
    return err(
      new DomainError('Password must include an uppercase letter', {
        code: 'PASSWORD_WEAK',
      }),
    );
  }

  if (!LOWERCASE.test(password)) {
    return err(
      new DomainError('Password must include a lowercase letter', {
        code: 'PASSWORD_WEAK',
      }),
    );
  }

  if (!DIGIT.test(password)) {
    return err(
      new DomainError('Password must include a number', { code: 'PASSWORD_WEAK' }),
    );
  }

  if (!SPECIAL.test(password)) {
    return err(
      new DomainError('Password must include a special character', {
        code: 'PASSWORD_WEAK',
      }),
    );
  }

  return ok(password);
}
