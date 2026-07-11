import { SecretsProvider } from '@edutrack/config';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

export interface SecurityAuditFinding {
  readonly code: string;
  readonly severity: 'info' | 'warning' | 'critical';
  readonly message: string;
}

export interface SecurityConfigurationAudit {
  readonly environment: string;
  readonly redisRequired: boolean;
  readonly redisConfigured: boolean;
  readonly findings: readonly SecurityAuditFinding[];
  readonly healthy: boolean;
}

@Injectable()
export class SecurityBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(SecurityBootstrapService.name);
  private readonly secrets = new SecretsProvider();

  onModuleInit(): void {
    if (process.env['NODE_ENV'] === 'test') {
      return;
    }

    const audit = this.auditConfiguration();
    for (const finding of audit.findings) {
      const message = `[${finding.code}] ${finding.message}`;
      if (finding.severity === 'critical') {
        this.logger.error(message);
      } else if (finding.severity === 'warning') {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    }

    if (!audit.healthy && audit.environment === 'production') {
      throw new Error('Security bootstrap failed — see audit findings');
    }
  }

  auditConfiguration(): SecurityConfigurationAudit {
    const environment = process.env['NODE_ENV'] ?? 'development';
    const redisRequired = process.env['REDIS_REQUIRED'] === 'true';
    const redisConfigured = Boolean(process.env['REDIS_URL']);
    const findings: SecurityAuditFinding[] = [];

    this.validateJwtKeys(findings, environment);
    this.validateMfaEncryption(findings, environment);
    this.validateCors(findings, environment);
    this.validateRedis(findings, redisRequired, redisConfigured, environment);

    const healthy = !findings.some((finding) => finding.severity === 'critical');
    return {
      environment,
      redisRequired,
      redisConfigured,
      findings,
      healthy,
    };
  }

  private validateJwtKeys(findings: SecurityAuditFinding[], environment: string): void {
    try {
      this.secrets.getSecret('JWT_PRIVATE_KEY');
      this.secrets.getSecret('JWT_PUBLIC_KEY');
    } catch {
      findings.push({
        code: 'SEC-JWT-001',
        severity: environment === 'production' ? 'critical' : 'warning',
        message: 'JWT signing keys are not configured',
      });
    }
  }

  private validateMfaEncryption(
    findings: SecurityAuditFinding[],
    environment: string,
  ): void {
    if (
      !this.secrets.getOptionalSecret('MFA_ENCRYPTION_KEY') &&
      environment === 'production'
    ) {
      findings.push({
        code: 'SEC-MFA-001',
        severity: 'warning',
        message:
          'Dedicated MFA encryption key not set — falling back to JWT private key',
      });
    }
  }

  private validateCors(findings: SecurityAuditFinding[], environment: string): void {
    const cors = process.env['CORS_ORIGINS'] ?? '*';
    if (environment === 'production' && cors.trim() === '*') {
      findings.push({
        code: 'SEC-CORS-001',
        severity: 'critical',
        message: 'CORS_ORIGINS must not be wildcard in production',
      });
    }
  }

  private validateRedis(
    findings: SecurityAuditFinding[],
    redisRequired: boolean,
    redisConfigured: boolean,
    environment: string,
  ): void {
    if (redisRequired && !redisConfigured) {
      findings.push({
        code: 'SEC-REDIS-001',
        severity: 'critical',
        message: 'REDIS_URL is required when REDIS_REQUIRED=true',
      });
    }
    if (environment === 'production' && !redisConfigured && !redisRequired) {
      findings.push({
        code: 'SEC-REDIS-002',
        severity: 'warning',
        message:
          'Redis not configured — rate limiting and permission cache use in-memory fallback',
      });
    }
  }
}
