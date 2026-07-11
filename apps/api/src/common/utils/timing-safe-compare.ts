import { timingSafeEqual } from 'node:crypto';

/** Timing-safe string comparison — OWASP / NFR-SEC-001 */
export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}
