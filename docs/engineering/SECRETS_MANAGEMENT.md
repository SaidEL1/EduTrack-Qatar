# Secrets Management

**References:** EDU-BP-007 §15, EDU-ARCH-005 security checklist, NFR-SEC-*

## Principles

1. **Never commit secrets** — `.env`, `.env.local`, keys, credentials are gitignored
2. **Fail fast** — missing secrets throw `EduTrackError` at startup
3. **Least privilege** — each service receives only required secrets
4. **Rotate regularly** — JWT keys, DB passwords per security runbook

## Local development

1. Copy `.env.example` → `.env.local`
2. Use Docker Compose defaults for Postgres/Redis
3. Prefix app secrets with `EDUTRACK_` for `SecretsProvider`:

```bash
EDUTRACK_JWT_PRIVATE_KEY=...
```

## Production (Sprint 1+)

| Environment | Provider                         |
| ----------- | -------------------------------- |
| development | `.env.local`                     |
| staging     | AWS Secrets Manager (me-south-1) |
| production  | AWS Secrets Manager (me-south-1) |

## Code usage

```typescript
import { SecretsProvider } from '@edutrack/config';

const secrets = new SecretsProvider({ prefix: 'EDUTRACK_' });
const key = secrets.getSecret('JWT_PRIVATE_KEY');
```

## CI/CD

- GitHub Actions secrets for deploy credentials only
- Gitleaks scan on every PR (`.github/workflows/ci.yml`)
- No secret values in logs — Pino redaction paths configured in `@edutrack/logging`

## Incident response

If a secret is committed:

1. Rotate immediately
2. Remove from git history (Security Lead)
3. Post-mortem within 24 hours

See `docs/runbooks/INCIDENT_RESPONSE.md` (stub).
