# Backend

Spring Boot 3 REST API for the I-ITSM application. Requires Java 17+ and
PostgreSQL.

## Configuration

The repository root `.env` is the local environment file. It is ignored by Git.
Spring Boot does not load `.env` automatically, so start the API from the
repository root with `./scripts/run-backend.ps1` (Windows PowerShell); the
helper exports its entries to the backend process without printing their
values. `backend/.env.example` documents the required variable names. Optional
Firebase and SMTP integrations should be enabled only when configured.

## Run

From the repository root:

```powershell
.\scripts\run-backend.ps1
```

The API listens on port 8080 by default. API configuration is in
`src/main/resources/application.yml`; schema and service/SLA seed scripts are
in the same resources directory and run on startup by default. Fixed demo users
are not seeded. For a recording, set `DEMO_ACCOUNTS_ENABLED=true` and provide
private `DEMO_ADMIN_*`, `DEMO_TEAM_LEAD_*`, `DEMO_TECHNICIAN_*`, and
`DEMO_EMPLOYEE_*` variables. The app hashes these passwords when creating the
local accounts.

Run the backend test suite with `./mvnw test` (Windows: `mvnw.cmd test`).
