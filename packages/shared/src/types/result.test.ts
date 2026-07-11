import { err, isErr, isOk, ok, unwrapOr } from './result.js';

describe('Result', () => {
  it('creates ok results', () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe(42);
    }
  });

  it('creates err results', () => {
    const error = new Error('fail');
    const result = err(error);
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe('fail');
    }
  });

  it('unwraps with fallback on error', () => {
    expect(unwrapOr(ok('yes'), 'no')).toBe('yes');
    expect(unwrapOr(err('bad'), 'no')).toBe('no');
  });
});
