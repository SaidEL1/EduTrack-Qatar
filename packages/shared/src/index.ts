export {
  APP_NAME,
  APP_VERSION,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from './constants/index.js';
export { EduTrackError, isEduTrackError } from './errors/edutrack-error.js';
export type {
  EduTrackErrorCode,
  EduTrackErrorOptions,
} from './errors/edutrack-error.js';
export { err, ok, isErr, isOk, unwrapOr } from './types/result.js';
export type { Result } from './types/result.js';
export type { Brand, LocaleCode, TenantId, CorrelationId } from './types/branded.js';
export { createCorrelationId, parseCorrelationId } from './utils/correlation-id.js';
