# I-ITSM — AGENT INSTRUCTIONS & NON-NEGOTIABLE RULES

> **Purpose:** This file is the shared source of truth for every human contributor and AI coding agent working in the Intelligent IT Service Management & Incident Resolution System (I-ITSM).
>
> **Read this file before planning, editing, generating, or reviewing code.** Also read the relevant project requirements and team roadmap in the repository. These instructions apply to Copilot, Codex, Cursor, ChatGPT-based agents, and human contributors.
>
> **Authority:** The approved project requirements and team decisions take precedence over an AI agent's preferences. Do not silently change scope, business rules, architecture, shared contracts, or another person's work.

---

## 1. Project identity and scope

**Project:** Intelligent IT Service Management & Incident Resolution System (I-ITSM)

**Core workflow:**

1. Incident creation.
2. Incident sorting: classification and deterministic priority calculation.
3. Technician assignment.
4. ITSM operational dashboard and lifecycle management, including SLA tracking, workload monitoring, duplicate detection, escalation, audit history, and notifications.

The system is for internal IT service management. Example affected services include corporate network/VPN, SSO/authentication, databases, ERP/CRM, and cloud storage.

### Explicit exclusions

- No payment gateway, billing, invoicing, or financial transaction functionality.
- Do not expand the project into a general-purpose customer-support, CRM, or asset-management platform unless the team formally approves a scope change.
- Do not add unrelated features simply because a framework or AI tool suggests them.

### Product users

- **Employee / requester**
- **Technician / engineer**
- **Team lead / escalation manager**
- **Administrator / IT manager**

Users authenticate with pre-registered accounts and assigned roles. Seed data may be used for the project demonstration.

---

## 2. Approved technology direction

Use the repository's existing implementation and configuration where present. The agreed application direction is:

- **Frontend:** React.
- **Backend:** Java with Spring Boot.
- **API:** REST endpoints.
- **Persistence:** PostgreSQL using Spring Data JPA.
- **Backend tests:** JUnit 5 and Mockito.
- **Source control and collaboration:** Git and GitHub.

The requirements mention Swagger API documentation and JavaMailSender/SMTP for email notifications. Use these where they fit the approved implementation.

### Technology guardrails

- Do not replace the approved stack or introduce another framework without explicit team agreement.
- Do not assume a build tool, React bundler, CSS framework, ORM alternative, or deployment provider. Inspect the repository first and follow its existing configuration.
- Do not introduce microservices, serverless infrastructure, a separate Python AI service, or a second database unless the team explicitly approves that architectural change.
- Keep the implementation appropriately small and demonstrable for the course project.
- The required duplicate detector is a deterministic text-similarity feature. Do not make an external LLM/API a runtime dependency or describe the feature as generative AI unless the team explicitly approves and documents that change.

---

## 3. Non-negotiable engineering rules

1. **Inspect before editing.** Read the relevant source files, tests, project structure, and existing conventions before changing anything.
2. **Preserve existing work.** Never overwrite, delete, or refactor another contributor's work without coordination.
3. **Respect ownership.** Work within the assigned feature branch and module. Coordinate cross-module changes with the owner.
4. **No invented contracts.** Do not invent or rename shared fields, enum values, endpoints, permissions, or business rules. If a requirement is unclear, document the ambiguity and ask the team.
5. **No duplicate domain models.** Reuse the agreed shared `Incident`, user, technician, service, and enum contracts. Do not create competing copies in individual modules.
6. **Keep layers separate.** Controllers handle HTTP concerns; services implement use cases; domain objects enforce domain rules; repositories handle persistence. Do not put business logic in React components or REST controllers.
7. **Use DTOs at API boundaries.** Do not expose JPA entities directly as request/response contracts. Validate incoming data and return consistent, useful error responses.
8. **Enforce authorization on the server.** Hiding a button in React is not access control. Protect endpoints and data access with backend authorization.
9. **Use transactions for consistency.** State transitions, assignment changes, and their required audit records must be atomic as specified.
10. **Keep audit history append-only.** Application interfaces and ordinary application operations must not update or delete audit records.
11. **Use UTC for persisted timestamps and SLA calculations.** Do not use the browser's local clock as the source of truth.
12. **Protect secrets.** Never commit passwords, JWT secrets, API keys, SMTP credentials, tokens, or real personal data. Use environment variables and safe example configuration.
13. **Do not swallow errors.** Handle failures explicitly, log useful context without secrets, and return meaningful API errors.
14. **Do not claim tests passed unless you ran them.** Report commands run, results, and any tests not run.
15. **Keep changes focused.** Avoid unrelated formatting churn, dependency upgrades, mass renames, or broad refactors.
16. **Explain design-pattern use.** Implement patterns to solve the stated requirements, not merely to add pattern-named classes.
17. **Update documentation.** If an approved API, schema, business rule, or setup instruction changes, update the relevant documentation in the same change.
18. **Ask before major decisions.** If requirements conflict or a change affects another module, stop and ask rather than guessing.

---

## 4. Shared domain contracts

The team must agree on shared contracts before parallel feature implementation. The roadmap places shared core contracts under:

`backend/src/main/java/com/iitsm/core/`

Follow the actual package structure if the repository already has an agreed equivalent; do not create a second core package.

### Required shared enums

Use these exact values unless the team formally approves a documented change:

- `IncidentStatus`: `NEW`, `CLASSIFIED`, `ASSIGNED`, `ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`, `VERIFIED`, `CLOSED`
- `Priority`: `P1_CRITICAL`, `P2_HIGH`, `P3_MEDIUM`, `P4_LOW`
- `Urgency`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `Impact`: `INDIVIDUAL`, `DEPARTMENT`, `ORGANIZATION_WIDE`
- `IncidentCategory`: `HARDWARE`, `SOFTWARE`, `NETWORK`, `DATABASE`, `CLOUD`, `SECURITY`, `AUTHENTICATION`, `APPLICATION`, `STORAGE`
- `UserRole`: `ROLE_EMPLOYEE`, `ROLE_TECHNICIAN`, `ROLE_TEAM_LEAD`, `ROLE_ADMIN`
- `AvailabilityStatus`: `AVAILABLE`, `ON_LEAVE`, `OFF_DUTY`
- `SlaStatus`: `NORMAL`, `WARNING`, `BREACHED`

### Incident creation contract

Incident creation must capture:

- Title.
- Detailed description.
- Affected digital service.
- Incident category.
- User-reported urgency.
- Scope of impact.
- Reporter identity from the authenticated user context.

On creation, the system must generate a globally unique identifier (example format: `INC-20261108-0012`), record a UTC creation timestamp, set status to `NEW`, and link the reporter.

Do not trust a client-supplied reporter ID when the authenticated identity is available.

### Lifecycle state machine

The required sequence is:

`NEW → CLASSIFIED → ASSIGNED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED → VERIFIED → CLOSED`

- Enforce transitions in backend domain/business logic.
- Reject skipped, backward, or otherwise invalid transitions with an appropriate domain exception, including `InvalidStateTransitionException` for invalid transitions.
- `ASSIGNED → ACKNOWLEDGED` records the response-time milestone.
- `IN_PROGRESS → RESOLVED` requires resolution notes and root-cause details and records the resolution-time milestone.
- The reporting employee verifies their own incident; an Administrator may override as specified.
- Once `CLOSED`, incident fields are read-only and further status mutations are prohibited.
- Do not add shortcuts such as `NEW → RESOLVED` or `ASSIGNED → CLOSED`.

---

## 5. Priority calculation — exact business rule

Priority must be computed by the backend, not accepted as the authoritative value from the frontend.

**Formula:**

`Score = (Impact × Urgency × Business Criticality Factor) + Service Weight`

### Input scales

**Impact (I):**

| Value | Numeric value |
|---|---:|
| `INDIVIDUAL` | 1 |
| `DEPARTMENT` | 2 |
| `ORGANIZATION_WIDE` | 4 |

**Urgency (U):**

| Value | Numeric value |
|---|---:|
| `LOW` | 1 |
| `MEDIUM` | 2 |
| `HIGH` | 3 |
| `CRITICAL` | 4 |

**Business Criticality Factor (C):**

| Service criticality | Factor |
|---|---:|
| Non-critical | 1.0 |
| Supporting service | 1.25 |
| Core business service | 1.5 |
| Mission-critical infrastructure (e.g. SSO, corporate network, database) | 2.0 |

**Service Weight (W):** 0 to 4 according to service tier.

### Priority bands

| Score | Priority |
|---|---|
| `score >= 24` | `P1_CRITICAL` |
| `14 <= score < 24` | `P2_HIGH` |
| `6 <= score < 14` | `P3_MEDIUM` |
| `score < 6` | `P4_LOW` |

- Keep the calculation deterministic and testable.
- Preserve the score and enough input/breakdown information to explain the result in the UI, if supported by the agreed data contract.
- Transition the incident from `NEW` to `CLASSIFIED` after classification and priority calculation complete.
- Do not silently change the formula, factors, weights, or thresholds.

---

## 6. SLA rules and escalation

### Response and resolution targets

| Priority | Response target | Resolution target |
|---|---:|---:|
| P1 — Critical | 5 minutes | 30 minutes |
| P2 — High | 15 minutes | 2 hours |
| P3 — Medium | 1 hour | 8 hours |
| P4 — Low | 4 hours | 24 hours |

The business rules define response time from ticket creation until `ACKNOWLEDGED`, and resolution time from ticket creation until `RESOLVED`.

### Monitoring behavior

- A scheduled backend monitor checks active incidents every **60 seconds**.
- At **75%** of the relevant target window, emit an SLA warning and show a warning state on the dashboard.
- At **100%** of the target, mark the relevant SLA as breached, expose the breach in the dashboard, and create an SLA-breach audit record.
- SLA status values are `NORMAL`, `WARNING`, and `BREACHED`.
- The scheduler cycle should complete within **2 seconds** and must not lock ticket rows as specified by the performance requirements.
- Make warning/breach processing idempotent: repeated scheduler runs must not create duplicate warning or breach events/audit entries for the same milestone.

### P1 escalation rules

- If a P1 incident remains `ASSIGNED` and unacknowledged for 5 minutes after assignment, escalate it to the Team Lead.
- If a P1 incident remains unresolved at 75% of its 30-minute resolution window (22.5 minutes from creation under the stated resolution-SLA rule), escalate it to the IT Administrator.
- Record escalation actions in the audit trail and notify the relevant recipient.

**Clarification to preserve:** The requirements measure the response SLA from creation to acknowledgement, while the P1 unacknowledged escalation wording measures 5 minutes from assignment. Do not silently collapse these into one clock. If the team wants a different interpretation, agree and document it.

---

## 7. Technician assignment rules

Implement assignment using the **Strategy Pattern** with interchangeable strategies:

1. **Skill-based:** Only consider available technicians with a skill matching the incident category; among eligible candidates, choose the lowest active workload.
2. **Load-based:** Choose the available eligible technician with the lowest capacity-utilization ratio: `active tickets / maxConcurrentWorkload`.
3. **Round-robin fallback:** Cyclically distribute work when the relevant skill/load metrics are tied, as specified.

### Guardrails

- Automated assignment may select only technicians with `AVAILABLE` status.
- Do not assign to a technician at or above their configured maximum concurrent workload.
- Default maximum concurrent workload is **5**.
- Active workload counts statuses `ASSIGNED`, `ACKNOWLEDGED`, and `IN_PROGRESS`.
- Skill-based assignment must match technician skill tags to the incident category.
- Successful assignment transitions the incident from `CLASSIFIED` to `ASSIGNED` and dispatches an assignment notification.
- Manual reassignment is restricted to Team Leads and Administrators.
- If no eligible technician exists, return a clear domain/API outcome; do not silently exceed capacity or assign an unavailable technician.

The Administrator can configure the active assignment strategy.

---

## 8. Duplicate incident detection

The required duplicate detector is deterministic text similarity, not an opaque or mandatory external AI service.

- Compare the incoming incident title and description with active/open incidents.
- Compare only incidents affecting the **same affected service** and created within the **last 24 hours**.
- Flag a potential duplicate when similarity is **greater than or equal to 0.80 (80%)**.
- Link the new incident to the primary/parent incident ID.
- Make the correlation visible on the technician dashboard to reduce redundant troubleshooting.
- Keep the similarity implementation isolated behind a service/interface so the algorithm can be tested and replaced deliberately if the team approves.
- The roadmap mentions tokenized Jaccard similarity and Levenshtein distance. Use these as the documented implementation direction; document the exact normalization and score-combination method rather than inventing an undocumented formula.
- Do not compare across different affected services or outside the specified 24-hour window.

---

## 9. Roles, permissions, and security

Enforce the requirements on the backend using Spring Security and role-based access control.

### Permission summary

- **All roles:** authenticate/login, create incident tickets, view their own reported tickets, add comments/updates as allowed by the requirements.
- **Employee:** view only their own reported tickets; verify/close their own resolved incident.
- **Technician:** view assigned queue; acknowledge, investigate, and resolve assigned incidents; view relevant SLA warnings/breaches.
- **Team Lead:** view team queue and SLA status; manually reassign incidents; perform the specified verification/closure override; limited audit visibility.
- **Administrator:** global incident visibility; configure assignment strategy, SLA policies and services; manage technicians/capacity; full audit access; perform specified overrides.

Use the complete permission matrix in the requirements document as the authority when implementing an individual endpoint.

### Mandatory security controls

- Hash passwords with **BCrypt, work factor 10**.
- Use signed JWTs for stateless authentication.
- Clients send JWTs in the `Authorization: Bearer <token>` header.
- Enforce endpoint authorization (e.g. `@PreAuthorize`) and record-level data isolation.
- Employees must not access another employee's tickets.
- Technicians must not access tickets outside their permitted assigned/team scope.
- Administrators have global visibility as specified.
- Validate and sanitize user-controlled titles, descriptions, comments, and resolution notes.
- Use parameterized persistence queries / safe ORM APIs; never concatenate untrusted input into SQL.
- Never persist or log plaintext passwords, JWTs, secrets, or credentials.
- Return `401` for unauthenticated access and `403` for authenticated users without permission, where appropriate.

---

## 10. Notifications, events, and audit trail

Use the **Observer Pattern** / Spring application events to decouple event producers from notification and audit consumers.

Required event types include:

- `IncidentCreated`
- `IncidentAssigned`
- `IncidentAcknowledged`
- `SlaWarning`
- `SlaBreached`
- `IncidentEscalated`
- `IncidentResolved`
- `IncidentClosed`

Expected listeners/consumers include:

- Audit log listener.
- In-app notification listener.
- Email notification listener.

### Notification behavior

- Persist in-app notifications and expose the logged-in user's notification feed.
- Update the notification indicator/feed for logged-in users using the approved implementation.
- Dispatch email using standard SMTP (e.g. Mailtrap/SendGrid for development/testing).
- If an external SMTP server is unavailable, log a warning and do not fail or roll back the primary incident state transition.

### Audit behavior

- Record timestamp (UTC), actor, action, previous state, new state, and description/details.
- Record every state modification, assignment change, SLA warning, and escalation.
- Required audit insertion must be atomic with the corresponding state/assignment change.
- Audit records are append-only and cannot be edited or deleted through application interfaces or normal application operations.
- Do not use audit logs as mutable status storage; the incident's current state remains in its domain record.

---

## 11. Dashboard and functional expectations

Provide role-tailored views:

### Employee self-service

- Create incident form.
- View only their submitted incidents.
- See status, investigation updates, and verification prompt.

### Technician dashboard

- Assigned active queue.
- Priority indicators.
- Response/resolution SLA countdowns and warning/breach states.
- Quick actions: acknowledge, start investigation, resolve.
- Potential duplicate indicators.

### Team Lead / Administrator operational dashboard

- Total active, P1 critical, resolved, and breached incidents.
- Technician active workload compared with capacity.
- Incident counts grouped by affected service.
- Search/filter by incident ID, date range, status, priority, category, service, assigned technician, and SLA status.
- Team Lead sees team-level information; Administrator sees global information.
- Admin configuration for services, SLA policies, assignment strategies, and technician capacity as authorized.

Use the specified visual meaning:
- Priority: P1 red, P2 orange, P3 yellow, P4 blue/green.
- SLA: normal green, warning yellow, breached red.

The stated dashboard workstation target is responsive operation at standard enterprise display widths of at least 1024 px. Do not interpret this as permission to ignore reasonable smaller-screen usability.

---

## 12. Object-oriented design and required patterns

Apply SOLID principles and keep dependencies directed toward abstractions where practical.

### Required design patterns

- **State Pattern:** encapsulate the eight incident lifecycle states and valid transitions.
- **Strategy Pattern:** interchangeable technician assignment algorithms. The priority calculation may also be structured behind a strategy abstraction if useful, without changing its required formula.
- **Observer Pattern:** publish domain events and react through audit and notification listeners.
- **Factory Pattern:** use a factory where standardized creation of incident or notification objects is useful and meaningful.

Do not add pattern classes that do not contribute to the required behavior. Be prepared to explain the pattern's role, participants, and benefit in the report and demo.

---

## 13. Persistence, consistency, and performance

- PostgreSQL is the system of record for incidents, users, assignments, SLA tracking, services, notifications, and audit history.
- Use relational foreign keys, not-null constraints, and appropriate enum/domain constraints.
- Use Spring Data JPA repositories consistently with the existing project.
- Use database migrations/schema management if already established; do not make undocumented manual-only schema changes.
- Seed demonstration data: initial Administrator, Team Lead, and five technicians with varied skills, plus service catalog entries and SLA policies.
- Persist timestamps in UTC and use a synchronized server clock.
- Use `@Transactional` boundaries so incident state transitions, assignment updates, and required audit records are atomic.
- SMTP failure must not roll back the primary ticket operation.
- Avoid long-running work while holding database locks.

### Required performance targets

- Dashboard queries, sorting, and filter requests: **≤ 500 ms under 100 concurrent user sessions**.
- Priority calculation and duplicate similarity scoring during ticket creation: **≤ 100 ms**.
- SLA monitor sweep: **≤ 2 seconds per 60-second cycle**, without locking ticket rows.

Do not claim these targets have been demonstrated unless an appropriate test or measurement was actually run. If the student environment cannot verify the full concurrency target, document the limitation honestly.

---

## 14. Team ownership — full-stack vertical slices

Every member contributes across the stack for their assigned feature: React UI, Java/Spring Boot domain and service logic, PostgreSQL/JPA persistence, REST APIs/DTOs, at least four automated tests, documentation, and an individual demo segment.

### Person 1 — Incident lifecycle and State Engine

**Branch:** `feature/incident-management`

Owns:
- Incident reporting form, detail/lifecycle actions, comments/timeline.
- `Incident` and `IncidentComment` domain entities.
- State Pattern and the eight lifecycle states.
- Incident service, validation, and lifecycle exceptions.
- `incidents` and `incident_comments` persistence.
- Incident creation and lifecycle REST endpoints.
- Tests for complete lifecycle, invalid transitions, resolution-note validation, and authorization.
- UML class and use-case diagrams; demo ticket creation and lifecycle enforcement.

### Person 2 — Users, security, and technician assignment

**Branch:** `feature/users-assignment`

Owns:
- Login/registration and role-based redirection UI.
- Technician directory, skill/capacity management, availability and profile UI.
- User/Employee/Technician domain model and authentication.
- Spring Security, JWT, BCrypt, role guards.
- Assignment Strategy Pattern: skill-based, load-based, round-robin fallback.
- User, technician, and technician-skill persistence and seed accounts.
- Authentication, technician, and assignment APIs.
- Tests for skill match, workload cap, strategy switching, and authorization.
- ER diagram, schema, API documentation; demo login/RBAC and assignment.

Person 2 coordinates shared integration conventions and initial backend/security setup, but is **not** responsible for implementing every other member's controllers, services, or repositories. Each module owner implements their own vertical slice.

### Person 3 — Priority, SLA, escalation, and duplicate detection

**Branch:** `feature/sla-ai`

Owns:
- SLA countdown/warning badges, duplicate alert, priority breakdown UI.
- Priority score calculation using the exact formula and bands in this file.
- SLA policy and incident SLA tracking.
- 60-second scheduler, 75% warning, breach handling, and P1 escalation.
- Duplicate detection using the specified same-service/24-hour/0.80 rules.
- SLA and duplicate detection APIs and persistence.
- Tests for priority boundaries, 75% warning, breach, and duplicate matching.
- Priority rationale, SLA state chart, duplicate algorithm documentation; demo priority/SLA/duplicate/escalation.

### Person 4 — Service catalog, audit, notifications, and analytics

**Branch:** `feature/services-analytics`

Owns:
- IT manager dashboard, service catalog UI, audit timeline, notification center.
- Service, AuditLog, and Notification domain entities.
- Observer/event publisher and audit, in-app, and email listeners.
- Analytics aggregations for workload, MTTR, breach rates, and service health.
- Services, audit logs, and notifications persistence.
- Service, report, audit, and notification APIs.
- Tests for audit creation/immutability, observer notification, and analytics aggregation.
- Observer class diagram, architecture diagram, notification workflow; demo dashboard/audit/notifications.

### Shared integration expectations

- Agree on shared core enums, IDs, entity relationships, DTOs, and API contracts before parallel work.
- Coordinate cross-module calls/events through clear interfaces and documented contracts.
- Do not create duplicate `Incident`, `User`, or `Technician` definitions.
- Person 4 owns shared audit/notification infrastructure; other modules publish/use the agreed events rather than implementing separate audit or notification systems.
- Each member writes and maintains tests and documentation for their own module.
- Each member must understand and be able to explain their own frontend, backend, persistence, and OOP implementation.

---

## 15. API and implementation conventions

- Use the `/api` prefix as shown in the requirements and roadmap.
- Follow the agreed endpoint paths and HTTP methods. Existing approved API contracts take precedence over examples in an agent's plan.
- Use request/response DTOs with explicit validation.
- Use appropriate HTTP methods and status codes; do not use `GET` for state-changing operations.
- Keep endpoint authorization and ownership checks in the backend.
- Return stable error responses with a useful message and, where appropriate, a machine-readable error code.
- Avoid exposing internal stack traces, SQL, secrets, or sensitive data in API responses.
- Document endpoint changes and keep frontend API calls aligned with backend DTOs.
- Do not put database credentials or environment-specific URLs in source code.

The roadmap's representative endpoints include:

- `POST /api/incidents`
- `GET /api/incidents/{id}`
- `PATCH /api/incidents/{id}/acknowledge`
- `PATCH /api/incidents/{id}/investigate`
- `PATCH /api/incidents/{id}/resolve`
- `PATCH /api/incidents/{id}/verify`
- `PATCH /api/incidents/{id}/close`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/technicians`
- `PUT /api/technicians/{id}/availability`
- `POST /api/incidents/{id}/assign`
- `GET /api/sla/policies`
- `PUT /api/sla/policies/{id}`
- `GET /api/services`
- `POST /api/services`
- `GET /api/reports/overview`
- `GET /api/reports/technician-workload`
- `GET /api/reports/service-health`
- `GET /api/incidents/{id}/audit-trail`
- `GET /api/notifications`

If an endpoint is changed or consolidated, get team agreement and update the API contract and frontend callers.

---

## 16. Testing requirements

Each member must provide **at least four** meaningful unit/integration tests for their vertical slice, covering:

- Happy path.
- Boundary conditions.
- Invalid input/state or authorization failures.
- Relevant business rules.

Use JUnit 5 and Mockito for backend tests, following existing test conventions.

At minimum, collectively cover:
- Full incident lifecycle and illegal transitions.
- Resolution notes requirement and reporter verification authorization.
- Skill matching and workload ceiling.
- Assignment strategy switching.
- Priority formula and all priority boundaries.
- SLA warning at 75% and breach at 100%.
- Duplicate threshold, same-service restriction, and 24-hour window.
- Audit creation and append-only behavior.
- Notification event handling.
- Dashboard analytics aggregation.
- Authentication and role/data isolation.

Add integration tests for important API/database flows where practical. Do not replace tests with manual screenshots or claims.

---

## 17. Git and collaboration rules

### Branch ownership

- Person 1: `feature/incident-management`
- Person 2: `feature/users-assignment`
- Person 3: `feature/sla-ai`
- Person 4: `feature/services-analytics`

### Mandatory workflow

1. Start from an up-to-date `main`.
2. Work on your assigned feature branch.
3. Commit focused, logically grouped changes.
4. Push the feature branch.
5. Open a Pull Request to `main`.
6. Obtain review from at least one other team member.
7. Address review feedback and run relevant tests.
8. Merge only after review and checks are satisfactory.

**Never commit directly to `main`.** Do not force-push shared branches or rewrite another person's history without explicit coordination.

### Commit message examples

- `feat: implement SkillBasedAssignmentStrategy`
- `test: add invalid state transition cases`
- `fix: correct SLA warning threshold calculation`
- `docs: update incident API contract`

Avoid vague messages such as `updates`, `final`, or `changes`.

---

## 18. Documentation and final deliverables

Maintain the documentation needed to explain and assess the system:

- Problem analysis and requirements specification.
- UML class and use-case diagrams.
- ER diagram and database schema.
- API/Swagger documentation and API contracts.
- Priority algorithm rationale and examples.
- SLA state/monitoring and escalation documentation.
- Duplicate detection algorithm and threshold explanation.
- Observer/notification workflow.
- Architecture overview.
- Test cases and test results.
- Setup/run instructions and known limitations.

The roadmap states the final submission is due **22 November 2026** and includes:
- Final report PDF.
- **15–20 minute** video presentation.

The video should demonstrate the three specified end-to-end workflows:

1. Employee reports incident → priority calculated → technician assigned → notification dispatched.
2. Technician investigates → SLA countdown monitored → incident resolved → employee verifies and closes ticket.
3. Multiple tickets submitted → duplicate detected → unacknowledged ticket automatically escalated.

Each member must explain and demonstrate their own vertical slice.

---

## 19. Ambiguities and decisions that require team confirmation

AI agents must not silently resolve these:

1. **Registration policy:** The requirements assume pre-registered enterprise accounts, while the roadmap lists a registration endpoint/page. Confirm whether public self-registration is allowed or whether accounts are seeded/admin-created.
2. **Priority formula input ownership:** Confirm how service criticality factor and service weight are represented in the service catalog and how missing values are handled. Do not invent defaults beyond the stated scales.
3. **Duplicate similarity combination:** The roadmap mentions Jaccard and Levenshtein but does not specify how the two scores are combined. Agree on and document the exact formula.
4. **Real-time dashboard transport (RESOLVED):** Implemented via Spring Boot STOMP WebSocket broker (`/ws-iitsm`) with SockJS fallback, broadcasting over `/topic/notifications/{userId}` and `/topic/admin-alerts` for sub-50ms live client updates. Coupled with Google Firebase Cloud Messaging (FCM) for mobile push alerts.
5. **Response SLA versus P1 escalation clock:** Response SLA is measured from creation, while P1 unacknowledged escalation is worded as 5 minutes after assignment. Preserve both clocks unless the team explicitly decides otherwise.
6. **Resolution verification and closure:** The lifecycle lists separate `VERIFIED` and `CLOSED` states, while the permission matrix describes requester verification/closure. Agree on the exact actor/action mapping and document it without skipping either state.
7. **SLA policy changes:** Confirm whether policy edits apply only to new incidents or also affect already-open incidents.
8. **No eligible technician:** Agree whether the incident remains `CLASSIFIED` in an unassigned queue and how team leads are alerted. Never violate availability or capacity rules as a fallback.

When asking for a decision, present the relevant requirement text, the implementation impact, and a small set of concrete options.

---

## 20. Required AI-agent working protocol

Before making a change, the agent must:

1. Read this file and the relevant project requirement/roadmap sections.
2. Inspect the current repository tree and relevant implementation.
3. Identify the owning person/module and branch.
4. State a short plan, files expected to change, and any cross-module dependencies.
5. Check whether the shared API/domain contract already exists.
6. Ask before making a decision listed in Section 19 or changing a shared contract.

While implementing:

- Make the smallest coherent change that satisfies the requirement.
- Reuse existing patterns and dependencies.
- Add or update tests with the implementation.
- Keep code readable for a student team that must explain it in a viva/demo.
- Do not generate placeholder implementations that appear complete but do not work.
- Do not fabricate test output, API responses, screenshots, benchmark results, or documentation claims.

Before finishing, report:

1. What was implemented.
2. Which files changed.
3. Which requirements/business rules are covered.
4. Tests/commands actually run and their results.
5. Any known limitations or unimplemented cases.
6. Any required follow-up from another module owner.

**Definition of done:** A feature is not complete merely because code was generated. It must integrate with the agreed contracts, persist correctly where required, enforce permissions and business rules, have relevant tests, be documented, and be reviewable by another team member.

---

## 21. Person 4 Implementation & GoF Observer Architecture

The `feature/services-analytics` branch provides the full-stack implementation of the Service Desk, Notifications, and Analytics subsystem:

1. **Hybrid GoF Observer Pattern (`com.iitsm.events`):**
   - Explicit GoF contracts: `IncidentSubject` (`registerObserver`, `removeObserver`, `notifyObservers`) and `IncidentObserver` (`onIncidentEvent(IncidentEvent event)`).
   - Concrete `IncidentEventPublisher` manages registered observers while bridging seamlessly to Spring's `ApplicationEventPublisher`.
   - Concrete observers implement decoupled reactions:
     - `AuditLogObserver`: Synchronously commits immutable audit history within the active transaction.
     - `WebSocketNotificationObserver`: Broadcasts live STOMP JSON payloads to `/topic/notifications/{userId}` and `/topic/admin-alerts`.
     - `EmailNotificationObserver`: Asynchronously formats and sends SMTP email alerts via `JavaMailSender` (catches mail downtime without transaction rollback).
     - `FcmPushNotificationObserver`: Dispatches Google Firebase Cloud Messaging mobile push notifications with simulated fallback.

2. **Service Catalog & Dependency Graph (`com.iitsm.servicecatalog`):**
   - Models services, criticality factors ($C \in [1.0, 2.0]$), baseline SLA weights, and baseline MTTR.
   - Implements self-referencing `@ManyToMany` dependencies representing upstream/downstream architecture.
   - Enforces Directed Acyclic Graph (DAG) invariants via cycle-detection algorithms (rejects circular dependencies).
   - Serves `GET /api/services/dependency-graph` with nodes and edges for the React visualization.

3. **Intelligent Multi-Metric Bottleneck & Anomaly Detection Engine (`com.iitsm.analytics`):**
   - Service SLA Breach Bottleneck: Flags services where SLA breach rate $> 25\%$.
   - MTTR Degradation: Flags services where resolution time exceeds $1.5\times$ baseline expected MTTR.
   - Recurring Category Spike: Flags incident categories exceeding $35\%$ of active volume or deviating by $> 2\sigma$ from rolling averages.
   - Technician Capacity Saturation: Flags engineers with active load $\ge 80\%$ capacity limit.

4. **Hardware/Database-Level Immutable Audit Trail (`com.iitsm.audit`):**
   - Enforced by PostgreSQL trigger `trg_audit_logs_immutable` raising an exception on any `UPDATE` or `DELETE` statement.
   - JPA entity fields mapped with `@Column(updatable = false)`.

---

## 22. Product Landing Page, Firebase Hosting & Download Links Maintenance Rule

1. **Product Introduction & Cross-Platform Download Hub (`LandingPage.jsx`):**
   - The root user interface presents a dark-mode, enterprise product introduction page highlighting core capabilities, architecture highlights, and live metrics.
   - Features dedicated download cards for:
     - **Android Client (.apk):** Direct download package with Google FCM push background sync.
     - **Windows Desktop (.msix):** Native Windows desktop installer.
     - **Cloud Web Console (PWA):** Direct link launching into the live operational dashboard.
     - **Apple iOS:** Mobile Safari standalone PWA launcher.

2. **Firebase Hosting Integration (`frontend/firebase.json`):**
   - Configured to serve `dist/` directly via Firebase Hosting.
   - Deployable via `cd frontend && npm run build && firebase deploy --only hosting`.

3. **NON-NEGOTIABLE RULE: Continuous Download Links Maintenance:**
   - Every contributor and AI agent pushing updates to the repository must ensure that the download links and package filenames referenced in `LandingPage.jsx` (`bphc-iitsm-client-v1.0.apk`, `bphc-iitsm-desktop-setup.msix`, and Web Console routing) remain valid, synchronized, and functional with each build.
   - Breaking or disconnecting the download cards, or removing the cross-platform download links during UI refactoring, is strictly prohibited.

---

## 23. Cloud-Native Database Architecture & HikariCP Heartbeat Specification

1. **Supported Persistence Engines:**
   - Designed to run seamlessly against cloud-hosted serverless PostgreSQL (e.g. Neon, Supabase, Oracle Cloud Always-Free VM) or local PostgreSQL without code changes.
   - Connection string, username, and password configured via environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`) in `application.yml`.

2. **HikariCP Connection Pool Settings:**
   - `keepalive-time: 30000` (30 seconds): Emits periodic TCP heartbeat pings to prevent cloud firewalls from dropping idle serverless connections.
   - `max-lifetime: 600000` (10 minutes): Retires old connections cleanly before cloud host timeouts.
   - `connection-timeout: 30000` (30 seconds): Handles cold-start latency gracefully.
   - `maximum-pool-size: 10`: Limits connection consumption on free-tier database instances.

