import type { LocaleCode } from '@edutrack/shared';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@edutrack/shared';

export interface LocaleDefinition {
  readonly code: LocaleCode;
  readonly label: string;
  readonly direction: 'ltr' | 'rtl';
}

const EN_QA: LocaleDefinition = {
  code: 'en-QA' as LocaleCode,
  label: 'English',
  direction: 'ltr',
};

const AR_QA: LocaleDefinition = {
  code: 'ar-QA' as LocaleCode,
  label: 'العربية',
  direction: 'rtl',
};

const LOCALE_DEFINITIONS = new Map<LocaleCode, LocaleDefinition>([
  [EN_QA.code, EN_QA],
  [AR_QA.code, AR_QA],
]);

export function listLocales(): readonly LocaleDefinition[] {
  return SUPPORTED_LOCALES.map((code) => getLocaleDefinition(code));
}

export function getLocaleDefinition(
  code: LocaleCode = DEFAULT_LOCALE,
): LocaleDefinition {
  return LOCALE_DEFINITIONS.get(code) ?? EN_QA;
}
