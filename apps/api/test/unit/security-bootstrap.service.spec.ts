import { SecurityBootstrapService } from '../../src/modules/platform/application/security-bootstrap.service.js';

describe('SecurityBootstrapService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: 'development' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('audits configuration and reports findings', () => {
    process.env['CORS_ORIGINS'] = 'http://localhost:3000';
    const service = new SecurityBootstrapService();
    const audit = service.auditConfiguration();

    expect(audit.environment).toBe('development');
    expect(Array.isArray(audit.findings)).toBe(true);
  });

  it('flags wildcard CORS in production', () => {
    process.env['NODE_ENV'] = 'production';
    process.env['CORS_ORIGINS'] = '*';
    process.env['EDUTRACK_JWT_PRIVATE_KEY'] = 'test-private';
    process.env['EDUTRACK_JWT_PUBLIC_KEY'] = 'test-public';

    const service = new SecurityBootstrapService();
    const audit = service.auditConfiguration();

    expect(audit.findings.some((finding) => finding.code === 'SEC-CORS-001')).toBe(
      true,
    );
    expect(audit.healthy).toBe(false);
  });

  it('skips boot checks in test environment', () => {
    process.env['NODE_ENV'] = 'test';
    const service = new SecurityBootstrapService();
    expect(() => {
      service.onModuleInit();
    }).not.toThrow();
  });

  it('requires redis when REDIS_REQUIRED is enabled', () => {
    process.env['NODE_ENV'] = 'production';
    process.env['REDIS_REQUIRED'] = 'true';
    delete process.env['REDIS_URL'];

    const service = new SecurityBootstrapService();
    const audit = service.auditConfiguration();
    expect(audit.findings.some((finding) => finding.code === 'SEC-REDIS-001')).toBe(
      true,
    );
  });
});
