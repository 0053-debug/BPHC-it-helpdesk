# Backend

Spring Boot 3 REST API for the I-ITSM application. Requires Java 17+ and
PostgreSQL.

## Configuration

Copy `.env.example` to `.env` and provide a database URL, username, password,
and a strong `JWT_SECRET`. Optional Firebase and SMTP integrations should be
enabled only when their credentials are configured. Do not commit secrets.

## Run

From this directory:

```powershell
.\mvnw.cmd spring-boot:run
```

The API listens on port 8080 by default. API configuration is in
`src/main/resources/application.yml`; schema and service/SLA seed scripts are
in the same resources directory and run on startup by default. Fixed demo users
are not seeded. For a recording, set `DEMO_ACCOUNTS_ENABLED=true` and provide
private `DEMO_ADMIN_*`, `DEMO_TEAM_LEAD_*`, `DEMO_TECHNICIAN_*`, and
`DEMO_EMPLOYEE_*` variables. The app hashes these passwords when creating the
local accounts.

Run the backend test suite with `./mvnw test` (Windows: `mvnw.cmd test`).
