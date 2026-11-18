# Technology selection

| Layer | Selection | Reason | Trade-off |
|---|---|---|---|
| Browser UI | React 18, Vite, Tailwind CSS | Component-based role views, quick iteration, existing implementation | Client state needs careful API/error handling |
| API and business logic | Java 17, Spring Boot 3, Spring Security | Strong OOP support, validation, REST, scheduling, dependency injection | More setup and configuration than a small script service |
| Persistence | PostgreSQL; Spring Data JPA and JDBC | Relational integrity for users, services, incidents, audit, and SLA data | Current incident module uses JDBC and should be migrated to JPA only if time allows |
| Authentication | BCrypt and signed JWT | Stateless API authorization with role and record-level controls | Token storage/expiry and XSS protections need care |
| Notifications | In-app persistence and WebSocket; SMTP and Firebase are optional | Supports immediate dashboard feedback and demonstrable alternatives | Real provider credentials are required to exercise external delivery |
| Tests | JUnit 5, Mockito, Spring test support | Exercises rules, service behavior, and HTTP permissions | Database-specific behavior also needs PostgreSQL integration coverage |

The PDF permits teams to choose their technology stack. This repository uses
React, Java/Spring Boot, and PostgreSQL because the project is object-oriented,
relational, and requires role-aware REST operations, scheduled SLA monitoring,
and persistent audit history. Alternatives considered include a Node.js API,
MongoDB, and a mobile client. A document database offers less direct value for
the relational ownership and audit constraints; Node.js would also depart from
the team's Java OOP implementation. A mobile application is outside the core
incident workflow scope.

For larger deployments, the first steps would be database indexes and query
plans, pagination, connection-pool tuning, metrics, and horizontal scaling of
stateless API instances. The scheduler would need a distributed lock or a
single designated scheduler instance before running across multiple replicas.

## Security and operations

- Keep all database, JWT, mail, and push credentials in local environment
  variables or a managed secret store. `.env.example` contains names and safe
  placeholders only.
- `DEMO_ACCOUNTS_ENABLED` defaults to `false`; demo passwords are supplied by
  the presenter through environment variables and hashed at startup.
- Do not publish Firebase service-account keys or real employee data.
- Server-side authorization scopes employees to their own incidents and
  technicians to assigned incidents plus their own reports.
- User text is stored through parameterized SQL and rendered as text in React;
  do not render ticket content as raw HTML.
