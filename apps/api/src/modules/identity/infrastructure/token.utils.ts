import { createHash, randomBytes } from 'node:crypto';

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

export function generateFamilyId(): string {
  return randomBytes(16).toString('hex');
}
