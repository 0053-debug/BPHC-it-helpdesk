# Person 2 — Accounts, Security, and Technician Assignment

## What this module contains

- `POST /api/auth/register` creates an Employee only. Its validated request has no role field.
- `POST /api/auth/login` verifies BCrypt credentials and returns a signed bearer token plus a safe user summary.
- `GET /api/technicians` and `GET /api/technicians/{id}` return technician skills, availability, current active workload, and capacity.
- `PUT /api/technicians/{id}/availability` lets a technician update only their own status; administrators may update any technician.
- `GET/POST /api/admin/assignment-strategy` lets administrators select `SKILL_BASED`, `LOAD_BASED`, or `PRIORITY_AWARE`.
- The React app includes registration, login, a technician directory/profile, and role-aware navigation.

Passwords are stored as BCrypt hashes (work factor 10). JWTs are signed with `JWT_SECRET`, a Base64-encoded key containing at least 32 random bytes. The secret has no source-code default. Protected API requests use `Authorization: Bearer <token>`; server-side authorization does not trust a role supplied by the browser.

## Strategy Pattern

`TechnicianAssignmentService` uses the `AssignmentStrategy` interface with interchangeable strategies:

- `SKILL_BASED` requires an exact category skill match, then picks the eligible technician with the lowest active workload.
- `LOAD_BASED` picks the eligible technician with the lowest `active workload / capacity` ratio.
- `PRIORITY_AWARE` ranks eligible technicians using category-specific historical expertise and free capacity. It uses only incidents in `RESOLVED`, `VERIFIED`, or `CLOSED` with both `resolved_at` and `resolution_deadline` present. An incident is on time only when `resolved_at <= resolution_deadline`; the strategy does not infer success from `sla_breached`.

Expertise is calculated per technician and category:

```text
Expertise = 70 × ((OnTime + 1) / (Completed + 2))
            + 30 × min(Completed / 10.0, 1)
```

Examples (scores out of 100):

- Asha: `70 × (19 / 22) + 30 × 1 = 90.45` (20 completed, 18 on time).
- Dev: `70 × (6 / 7) + 30 × 0.5 = 75.00` (5 completed, 5 on time).
- Karan: `70 × (2 / 4) + 30 × 0.2 = 41.00` (2 completed, 1 on time).

Free capacity is `100 × (1 - ActiveWorkload / MaxWorkload)`. For 3 active incidents out of 5, free capacity is 40.

Priority weights are `P1 80% expertise / 20% capacity`, `P2 65% / 35%`, `P3 40% / 60%`, and `P4 20% / 80%`. For example, with expertise 90.45 and free capacity 40, a technician scores `80.36` for P1 and `50.09` for P4. A technician with expertise 75 and free capacity 100 scores `80.00` for P1 and `95.00` for P4, so P1 favors the first and P4 the second.

All three strategies exclude non-`AVAILABLE` or full-capacity technicians and break ties deterministically by technician ID. Skill-based and priority-aware require a matching skill; load-based retains its original category-independent behavior. Priority-aware also excludes inactive technicians, then picks the highest final score. Missing history is a cold start with `Completed=0`, `OnTime=0`, hence the smoothed expertise score is 35; it does not disqualify an eligible technician. Strategy selection currently lasts until the backend process restarts.

There is **no `Incident` JPA model or incident assignment controller in this branch**. To avoid a conflicting duplicate model, the strategies accept the shared incident category and technician list through a service boundary. The directory/workload adapter reads the existing `incidents` table contract (`assigned_technician_id`, `status`). Automatic/manual incident assignment, lifecycle transitions, and atomic persistence/notifications must be connected by the team after Person 1's Incident implementation is integrated.

## Environment and local setup

Use Java 17+, Maven, Node.js/npm, and PostgreSQL. Create a local database (default `iitsm_db`) and apply the existing shared schema in `backend/src/main/resources/schema.sql` once. Do not use the legacy `data.sql` as the authentication seed; demo accounts are created from private environment values instead.

Set these variables in the backend process environment:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/iitsm_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<your-local-db-password>
JWT_SECRET=<Base64 key containing at least 32 random bytes>
```

For example, generate a fresh JWT key in PowerShell (keep the output private and do not commit it):

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Optional demo accounts are **off by default**. To enable them, set `DEMO_ACCOUNTS_ENABLED=true` and provide `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD`, `DEMO_ADMIN_NAME`, the equivalent `DEMO_TEAM_LEAD_*` variables, and `DEMO_TECHNICIAN_EMAIL`, `DEMO_TECHNICIAN_PASSWORD`, `DEMO_TECHNICIAN_NAME`, `DEMO_TECHNICIAN_SKILLS`. Each password must be 8–72 UTF-8 bytes. Existing matching email accounts are not overwritten. Never put real credentials in source control.

Start the backend from `backend/`:

```powershell
mvn spring-boot:run
```

Start the frontend from `frontend/`:

```powershell
npm ci
npm run dev
```

Run backend tests with `mvn test` from `backend/`; build the frontend with `npm run build` from `frontend/`.

## Demo walkthrough

1. Register a new account. Its response is an Employee account, regardless of any role a caller tries to submit.
2. Sign in; the UI stores the bearer token and shows the technician directory.
3. Use an environment-configured demo technician account to change that technician's availability. An Employee cannot access administrator-only endpoints or change another user's availability.
4. Sign in as the configured administrator and switch among skill-based, load-based, and priority-aware strategies.
5. Once Person 1's incident persistence is integrated and the shared `incidents` table exists, demonstrate live active workloads and connect incident assignment to `TechnicianAssignmentService`.

The directory returns `503 Service Unavailable` with an integration message if the shared `incidents` table is not present; it does not fabricate workload counts.
