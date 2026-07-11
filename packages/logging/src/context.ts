import type { CorrelationId, TenantId } from '@edutrack/shared';

/** Structured log context per NFR-LOG-001 / ARCH-005 */
export interface LogContext {
  readonly service: string;
  readonly environment: string;
  readonly correlationId?: CorrelationId;
  readonly tenantId?: TenantId;
  readonly userId?: string;
  readonly requestId?: string;
  readonly [key: string]: unknown;
}

export function createLogContext(
  base: LogContext,
  overrides?: Partial<LogContext>,
): LogContext {
  return overrides ? { ...base, ...overrides } : base;
}

export function mergeLogContext(
  parent: LogContext,
  child: Partial<LogContext>,
): LogContext {
  return { ...parent, ...child };
}
