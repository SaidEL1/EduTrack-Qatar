import { randomUUID } from 'node:crypto';

import type { CorrelationId } from '../types/branded.js';

const CORRELATION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Generates a new correlation ID for request tracing (NFR-LOG-002 / ARCH-005) */
export function createCorrelationId(): CorrelationId {
  return randomUUID() as CorrelationId;
}

export function parseCorrelationId(
  value: string | undefined,
): CorrelationId | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!CORRELATION_ID_PATTERN.test(trimmed)) {
    return undefined;
  }
  return trimmed as CorrelationId;
}
