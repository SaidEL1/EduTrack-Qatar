import { Test, type TestingModule } from '@nestjs/testing';
import { authenticator } from 'otplib';

import { TotpService } from '../../src/modules/identity/infrastructure/totp.service.js';

describe('TotpService', () => {
  let service: TotpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TotpService],
    }).compile();

    service = module.get(TotpService);
  });

  it('generates enrollment secret and otpauth URL', () => {
    const enrollment = service.generateEnrollment('user@school.qa');
    expect(enrollment.secret).toBeTruthy();
    expect(enrollment.otpauthUrl).toContain('otpauth://');
  });

  it('verifies valid TOTP codes', () => {
    const { secret } = service.generateEnrollment('user@school.qa');
    const token = authenticator.generate(secret);
    expect(service.verify(token, secret)).toBe(true);
  });

  it('rejects invalid TOTP codes', () => {
    const { secret } = service.generateEnrollment('user@school.qa');
    expect(service.verify('000000', secret)).toBe(false);
  });
});
