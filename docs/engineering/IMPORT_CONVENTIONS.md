# Import Conventions

**References:** EDU-BP-007 §3 package boundaries, ESLint `@edutrack/eslint-config`

## Order (enforced by ESLint)

1. Node built-ins (`node:fs`, `node:path`)
2. External packages (`zod`, `pino`)
3. Internal workspace packages (`@edutrack/shared`)
4. Parent imports (`../`)
5. Sibling imports (`./`)

Blank line between groups. Alphabetical within groups.

## Workspace packages

```typescript
import { createLogger } from '@edutrack/logging';
import { ok, err } from '@edutrack/shared';
import type { TenantId } from '@edutrack/shared';
```

Always use workspace package names — never deep-import another package's `src/`.

## Boundary rules

| Consumer                | May import                                               | Must not import                          |
| ----------------------- | -------------------------------------------------------- | ---------------------------------------- |
| `apps/api` domain layer | `@edutrack/domain`, `@edutrack/shared`                   | infrastructure from other modules' infra |
| `apps/*-portal`         | `@edutrack/api-client`, `@edutrack/ui`, `@edutrack/i18n` | `@edutrack/domain`, direct DB            |
| `packages/ui`           | `@edutrack/shared` (types only)                          | apps, api-client, domain                 |
| `packages/api-client`   | `@edutrack/shared`                                       | `@edutrack/domain`                       |
| `workers/*`             | `@edutrack/logging`, `@edutrack/config`                  | portal apps, ui                          |

## ESM

- All packages use `"type": "module"`
- Use `.js` extension in relative imports for NodeNext resolution:

```typescript
import { EntityId } from './entity-id.js';
```

## Type-only imports

```typescript
import type { Result } from '@edutrack/shared';
```

Use inline type imports when re-exporting is not required.
