import { PasswordHasherService } from '../../src/modules/identity/infrastructure/password-hasher.service.js';

describe('PasswordHasherService', () => {
  const hasher = new PasswordHasherService();

  it('hashes and verifies passwords with Argon2id', async () => {
    const hash = await hasher.hash('SecurePass123!');
    expect(hash).toContain('$argon2id$');
    expect(await hasher.verify(hash, 'SecurePass123!')).toBe(true);
    expect(await hasher.verify(hash, 'WrongPassword1!')).toBe(false);
  });
});
