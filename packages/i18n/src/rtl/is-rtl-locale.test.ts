import type { LocaleCode } from '@edutrack/shared';

import { isRtlLocale } from './is-rtl-locale.js';

describe('isRtlLocale', () => {
  it('returns true for Arabic', () => {
    expect(isRtlLocale('ar-QA' as LocaleCode)).toBe(true);
  });

  it('returns false for English', () => {
    expect(isRtlLocale('en-QA' as LocaleCode)).toBe(false);
  });
});
