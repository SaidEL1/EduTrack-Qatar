import { timingSafeCompare } from '../../src/common/utils/timing-safe-compare.js';
import {
  hashToken,
  generateOpaqueToken,
} from '../../src/modules/identity/infrastructure/token.utils.js';

describe('token.utils', () => {
  it('hashes tokens deterministically', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
    expect(hashToken('abc')).not.toBe(hashToken('def'));
  });

  it('generates unique opaque tokens', () => {
    const a = generateOpaqueToken();
    const b = generateOpaqueToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });
});

describe('timingSafeCompare', () => {
  it('returns true for equal strings', () => {
    expect(timingSafeCompare('secret', 'secret')).toBe(true);
  });

  it('returns false for different strings', () => {
    expect(timingSafeCompare('secret', 'other')).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(timingSafeCompare('short', 'longer-string')).toBe(false);
  });
});
