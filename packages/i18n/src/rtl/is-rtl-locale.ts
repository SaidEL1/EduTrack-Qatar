import type { LocaleCode } from '@edutrack/shared';

import { getLocaleDefinition } from '../locales/registry.js';

export function isRtlLocale(code: LocaleCode): boolean {
  return getLocaleDefinition(code).direction === 'rtl';
}
