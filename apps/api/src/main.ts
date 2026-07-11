import 'reflect-metadata';

import { loadConfig } from '@edutrack/config';
import { createLogger } from '@edutrack/logging';
import { initOpenTelemetry, shutdownOpenTelemetry } from '@edutrack/observability';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { apiEnvSchema } from './config/api-env.schema.js';

async function bootstrap(): Promise<void> {
  const env = loadConfig({ schema: apiEnvSchema });

  if (env.OTEL_ENABLED) {
    initOpenTelemetry({
      serviceName: env.SERVICE_NAME,
      serviceVersion: '0.1.0',
      environment: env.NODE_ENV,
      metricsPort: env.METRICS_PORT,
    });
  }

  const logger = createLogger({
    prettyPrint: env.NODE_ENV === 'development',
    baseContext: {
      service: env.SERVICE_NAME,
      environment: env.NODE_ENV,
    },
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.use(helmet());
  app.enableShutdownHooks();
  app.setGlobalPrefix(env.API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EduTrack Platform API')
    .setDescription('Sprint 1 — Platform foundation (FR-SET-001/004/008)')
    .setVersion('0.1.0')
    .addApiKey({ type: 'apiKey', name: 'X-Tenant-Id', in: 'header' }, 'tenant')
    .addApiKey(
      { type: 'apiKey', name: 'X-Correlation-Id', in: 'header' },
      'correlation',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${env.API_PREFIX}/docs`, app, document);

  await app.listen(env.PORT, env.HOST);
  logger.info({ port: env.PORT, host: env.HOST }, 'EduTrack API started');

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully');
    await app.close();
    await shutdownOpenTelemetry();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
