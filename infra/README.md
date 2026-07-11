# Infrastructure

Terraform modules for AWS Bahrain deployment.

**Status:** Post Sprint 0 (EDU-BP-007). Sprint 0 delivers Docker Compose for local dev only.

Planned structure:

```
infra/
├── modules/
│   ├── vpc/
│   ├── rds/
│   ├── ecs/
│   └── redis/
├── environments/
│   ├── staging/
│   └── production/
└── README.md
```

Open question OQ-BP-04: separate AWS accounts per environment.
