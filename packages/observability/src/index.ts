export {
  initOpenTelemetry,
  shutdownOpenTelemetry,
  type OpenTelemetryOptions,
} from './otel/init-telemetry.js';
export { getMeter, recordHttpRequestDuration } from './metrics/http-metrics.js';
