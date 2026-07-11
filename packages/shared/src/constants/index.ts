import type { LocaleCode } from '../types/branded.js';

/** Product identifier — EDU-MPS-006 */
export const APP_NAME = 'EduTrack' as const;

/** Monorepo release line; semver managed via Changesets */
export const APP_VERSION = '0.0.0' as const;

/** Default locale per PX bilingual requirement (AR/EN) */
export const DEFAULT_LOCALE = 'en-QA' as LocaleCode;

/** Supported locales for MVP v1.0 */
export const SUPPORTED_LOCALES: readonly LocaleCode[] = [
  'en-QA' as LocaleCode,
  'ar-QA' as LocaleCode,
];
