import { generateKeyPairSync } from 'node:crypto';

/** Generates ephemeral RSA keys for test/integration environments */
export function ensureTestJwtKeys(): void {
  if (
    process.env['EDUTRACK_JWT_PRIVATE_KEY'] &&
    process.env['EDUTRACK_JWT_PUBLIC_KEY']
  ) {
    return;
  }

  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  process.env['EDUTRACK_JWT_PRIVATE_KEY'] = privateKey
    .export({ type: 'pkcs8', format: 'pem' })
    .toString();
  process.env['EDUTRACK_JWT_PUBLIC_KEY'] = publicKey
    .export({ type: 'spki', format: 'pem' })
    .toString();
}

export const TEST_PASSWORD = 'SecurePass123!';
