import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

import { SecretsProvider } from '@edutrack/config';
import { Injectable } from '@nestjs/common';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/** AES-256-GCM encryption for MFA secrets at rest — ADR-S2B-001 */
@Injectable()
export class SecretEncryptionService {
  private readonly secrets = new SecretsProvider();

  encrypt(plaintext: string): string {
    const key = this.deriveKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
  }

  decrypt(payload: string): string {
    const [ivB64, tagB64, dataB64] = payload.split('.');
    if (!ivB64 || !tagB64 || !dataB64) {
      throw new Error('Invalid encrypted payload');
    }
    const key = this.deriveKey();
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64url')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  private deriveKey(): Buffer {
    const material =
      this.secrets.getOptionalSecret('MFA_ENCRYPTION_KEY') ??
      this.secrets.getSecret('JWT_PRIVATE_KEY');
    return createHash('sha256').update(material).digest();
  }
}
