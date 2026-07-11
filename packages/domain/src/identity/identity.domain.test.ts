import { Email } from '../value-objects/email.js';

import { validatePasswordPolicy } from './password-policy.js';
import { canAuthenticate, isUserStatus } from './user-status.js';

describe('Identity domain', () => {
  describe('Email', () => {
    it('normalizes and validates email', () => {
      const result = Email.create('  Admin@School.QA  ');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('admin@school.qa');
      }
    });

    it('rejects invalid email', () => {
      const result = Email.create('not-an-email');
      expect(result.ok).toBe(false);
    });
  });

  describe('UserStatus', () => {
    it('identifies valid statuses', () => {
      expect(isUserStatus('active')).toBe(true);
      expect(isUserStatus('unknown')).toBe(false);
    });

    it('allows authentication only for active users', () => {
      expect(canAuthenticate('active')).toBe(true);
      expect(canAuthenticate('inactive')).toBe(false);
      expect(canAuthenticate('locked')).toBe(false);
    });
  });

  describe('Password policy (NFR-SEC-004)', () => {
    it('accepts strong passwords', () => {
      const result = validatePasswordPolicy('SecurePass123!');
      expect(result.ok).toBe(true);
    });

    it('rejects short passwords', () => {
      const result = validatePasswordPolicy('Short1!');
      expect(result.ok).toBe(false);
    });

    it('requires complexity', () => {
      expect(validatePasswordPolicy('alllowercase12!').ok).toBe(false);
      expect(validatePasswordPolicy('ALLUPPERCASE12!').ok).toBe(false);
      expect(validatePasswordPolicy('NoDigitsHere!!').ok).toBe(false);
      expect(validatePasswordPolicy('NoSpecial1234').ok).toBe(false);
    });
  });
});
