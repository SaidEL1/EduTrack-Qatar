import { Test, type TestingModule } from '@nestjs/testing';

import { SecretEncryptionService } from '../../src/modules/identity/infrastructure/secret-encryption.service.js';

describe('SecretEncryptionService', () => {
  let service: SecretEncryptionService;

  beforeAll(() => {
    process.env['EDUTRACK_JWT_PRIVATE_KEY'] =
      process.env['EDUTRACK_JWT_PRIVATE_KEY'] ?? 'test-jwt-private-key-for-encryption';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecretEncryptionService],
    }).compile();

    service = module.get(SecretEncryptionService);
  });

  it('encrypts and decrypts MFA secrets', () => {
    const plaintext = 'JBSWY3DPEHPK3PXP';
    const encrypted = service.encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(service.decrypt(encrypted)).toBe(plaintext);
  });

  it('rejects malformed payloads', () => {
    expect(() => service.decrypt('invalid')).toThrow('Invalid encrypted payload');
  });
});
