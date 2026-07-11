import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { authenticator } from 'otplib';

import { DRIZZLE } from '../../src/database/database.module.js';
import { MfaService } from '../../src/modules/identity/application/mfa.service.js';
import { UserMfaRepository } from '../../src/modules/identity/infrastructure/identity-security.repository.js';
import { SecretEncryptionService } from '../../src/modules/identity/infrastructure/secret-encryption.service.js';
import {
  MfaLoginChallengeRepository,
  SecurityEventRepository,
} from '../../src/modules/identity/infrastructure/security-event.repository.js';
import { TotpService } from '../../src/modules/identity/infrastructure/totp.service.js';

describe('MfaService', () => {
  let service: MfaService;
  let userMfaRepository: jest.Mocked<
    Pick<
      UserMfaRepository,
      'upsertPending' | 'findByUserId' | 'enable' | 'remove' | 'updateBackupCodes'
    >
  >;
  let secretEncryption: jest.Mocked<
    Pick<SecretEncryptionService, 'encrypt' | 'decrypt'>
  >;
  let mfaChallengeRepository: jest.Mocked<
    Pick<MfaLoginChallengeRepository, 'create' | 'consume'>
  >;
  let db: { update: jest.Mock; select: jest.Mock };

  const secret = authenticator.generateSecret();

  beforeEach(async () => {
    db = {
      update: jest
        .fn()
        .mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn() }) }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ mfaEnabled: true }]),
        }),
      }),
    };

    userMfaRepository = {
      upsertPending: jest.fn(),
      findByUserId: jest.fn(),
      enable: jest.fn(),
      remove: jest.fn(),
      updateBackupCodes: jest.fn(),
    };
    secretEncryption = {
      encrypt: jest.fn((value: string) => `enc:${value}`),
      decrypt: jest.fn((value: string) => value.replace('enc:', '')),
    };
    mfaChallengeRepository = {
      create: jest.fn(),
      consume: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MfaService,
        TotpService,
        { provide: DRIZZLE, useValue: db },
        { provide: UserMfaRepository, useValue: userMfaRepository },
        { provide: SecretEncryptionService, useValue: secretEncryption },
        { provide: MfaLoginChallengeRepository, useValue: mfaChallengeRepository },
        { provide: SecurityEventRepository, useValue: { record: jest.fn() } },
      ],
    }).compile();

    service = module.get(MfaService);
  });

  it('starts MFA enrollment', async () => {
    const result = await service.startEnrollment('user-1', 'admin@school.qa');
    expect(result.secret).toBeTruthy();
    expect(result.otpauthUrl).toContain('otpauth://');
    expect(userMfaRepository.upsertPending).toHaveBeenCalled();
  });

  it('confirms enrollment with valid TOTP code', async () => {
    const token = authenticator.generate(secret);
    userMfaRepository.findByUserId.mockResolvedValue({
      secretEncrypted: `enc:${secret}`,
      enabledAt: null,
      backupCodeHashes: null,
    });

    const result = await service.confirmEnrollment('user-1', token);
    expect(result.backupCodes).toHaveLength(10);
    expect(userMfaRepository.enable).toHaveBeenCalled();
  });

  it('verifies login challenge with valid code', async () => {
    const token = authenticator.generate(secret);
    mfaChallengeRepository.consume.mockResolvedValue({
      userId: 'user-1',
      tenantId: 'tenant-1',
      ipAddress: null,
    });
    userMfaRepository.findByUserId.mockResolvedValue({
      secretEncrypted: `enc:${secret}`,
      enabledAt: new Date(),
      backupCodeHashes: [],
    });

    const result = await service.verifyLoginChallenge('challenge', token);
    expect(result).toEqual({ userId: 'user-1', tenantId: 'tenant-1' });
  });

  it('rejects invalid login challenge', async () => {
    mfaChallengeRepository.consume.mockResolvedValue(null);
    await expect(service.verifyLoginChallenge('bad', '000000')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('disables MFA after valid code', async () => {
    const token = authenticator.generate(secret);
    userMfaRepository.findByUserId.mockResolvedValue({
      secretEncrypted: `enc:${secret}`,
      enabledAt: new Date(),
      backupCodeHashes: [],
    });

    await service.disable('user-1', token);
    expect(userMfaRepository.remove).toHaveBeenCalled();
  });

  it('regenerates backup codes', async () => {
    const token = authenticator.generate(secret);
    userMfaRepository.findByUserId.mockResolvedValue({
      secretEncrypted: `enc:${secret}`,
      enabledAt: new Date(),
      backupCodeHashes: [],
    });

    const codes = await service.regenerateBackupCodes('user-1', token);
    expect(codes).toHaveLength(10);
  });

  it('creates login challenge token', async () => {
    const token = await service.createLoginChallenge({
      userId: 'user-1',
      tenantId: 'tenant-1',
      ipAddress: '127.0.0.1',
    });
    expect(token).toBeTruthy();
    expect(mfaChallengeRepository.create).toHaveBeenCalled();
  });

  it('consumes backup code during verification', async () => {
    const backupCode = 'ABCDE12345';
    const { createHash } = await import('node:crypto');
    const hash = createHash('sha256').update(backupCode).digest('hex');

    userMfaRepository.findByUserId.mockResolvedValue({
      secretEncrypted: `enc:${secret}`,
      enabledAt: new Date(),
      backupCodeHashes: [hash],
    });

    const verified = await service.verifyCode('user-1', backupCode, {
      allowBackup: true,
    });
    expect(verified).toBe(true);
    expect(userMfaRepository.updateBackupCodes).toHaveBeenCalled();
  });
});
