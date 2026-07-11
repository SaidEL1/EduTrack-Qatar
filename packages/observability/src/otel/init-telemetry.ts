import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

export interface OpenTelemetryOptions {
  readonly serviceName: string;
  readonly serviceVersion: string;
  readonly environment: string;
  readonly metricsPort?: number;
}

let sdk: NodeSDK | undefined;

/**
 * Bootstraps OpenTelemetry metrics export (ARCH-005 § observability).
 * Tracing wiring expands in Sprint 2 with auth spans.
 */
export function initOpenTelemetry(options: OpenTelemetryOptions): void {
  if (sdk) {
    return;
  }

  const metricsPort = options.metricsPort ?? 9464;
  const prometheusExporter = new PrometheusExporter({ port: metricsPort });

  sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: options.serviceName,
      [ATTR_SERVICE_VERSION]: options.serviceVersion,
      'deployment.environment': options.environment,
    }),
    metricReader: prometheusExporter,
  });

  sdk.start();
}

export async function shutdownOpenTelemetry(): Promise<void> {
  if (!sdk) {
    return;
  }
  await sdk.shutdown();
  sdk = undefined;
}
