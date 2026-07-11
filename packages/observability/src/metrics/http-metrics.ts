import { metrics } from '@opentelemetry/api';

const METER_NAME = 'edutrack.http';

export function getMeter() {
  return metrics.getMeter(METER_NAME);
}

export function recordHttpRequestDuration(
  method: string,
  route: string,
  statusCode: number,
  durationMs: number,
): void {
  const meter = getMeter();
  const histogram = meter.createHistogram('http.server.duration', {
    description: 'HTTP request duration in milliseconds',
    unit: 'ms',
  });

  histogram.record(durationMs, {
    method,
    route,
    status_code: String(statusCode),
  });
}
