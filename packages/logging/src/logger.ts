import pino, { type Logger as PinoLogger } from 'pino';

import type { LogContext } from './context.js';

export type Logger = PinoLogger;

export interface LoggerOptions {
  readonly level?: pino.LevelWithSilent;
  readonly prettyPrint?: boolean;
  readonly baseContext: LogContext;
}

const REDACT_PATHS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'secret',
  'apiKey',
  '*.password',
  '*.token',
  '*.secret',
];

/**
 * Creates a structured Pino logger with tenant/correlation context.
 * @see NFR-LOG-001 — stdout JSON logs for centralized ingestion (ARCH-005)
 */
export function createLogger(options: LoggerOptions): Logger {
  const isDevelopment = options.baseContext.environment === 'development';
  const usePretty = options.prettyPrint ?? isDevelopment;

  const transport = usePretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

  return pino({
    level: options.level ?? (isDevelopment ? 'debug' : 'info'),
    base: {
      service: options.baseContext.service,
      environment: options.baseContext.environment,
      ...(options.baseContext.correlationId
        ? { correlationId: options.baseContext.correlationId }
        : {}),
      ...(options.baseContext.tenantId
        ? { tenantId: options.baseContext.tenantId }
        : {}),
    },
    redact: {
      paths: REDACT_PATHS,
      censor: '[REDACTED]',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(transport ? { transport } : {}),
  });
}
