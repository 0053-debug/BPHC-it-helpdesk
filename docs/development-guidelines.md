# Development guidelines

These guidelines apply to the shared I-ITSM codebase. The course brief and
[`requirements.md`](requirements.md) define the product scope and business
rules.

## Structure and implementation

- Keep the approved React, Java 17/Spring Boot, REST, and PostgreSQL stack.
- Put feature APIs, services, DTOs, and persistence code in the corresponding
  `com.iitsm` feature package. Keep controllers focused on HTTP concerns,
  services on use cases, and repositories/database access on persistence.
- Use DTOs and validation at API boundaries. Never trust a client-supplied
  reporter identity; derive it from the authenticated principal.
- Keep role checks and incident ownership checks on the server. UI visibility
  is not authorization.
- Use parameterized SQL/ORM APIs, atomic transactions for lifecycle and audit
  changes, and append-only audit history.
- Persist timestamps in UTC. Preserve the specified lifecycle, priority, SLA,
  duplicate, capacity, and escalation rules.
- Prefer a small, demonstrable implementation. Do not add unrelated products,
  frameworks, infrastructure, or unnecessary external runtime dependencies.

## Safe collaboration

- Inspect existing code and tests before changing a feature. Preserve work from
  other contributors and coordinate shared API or schema changes.
- Keep changes focused and update relevant docs when APIs, schema, or business
  rules change.
- Do not commit `.env` files, passwords, JWT secrets, API keys, mail passwords,
  service-account keys, or real personal data. Use `.env.example` placeholders.
- Report which compile/build/test commands were run and their actual results.

## Project design patterns

- **Strategy:** priority scoring and technician assignment.
- **Observer:** audit and notification effects from incident events.
- **Lifecycle validation:** `IncidentLifecycle` rejects skipped or backward
  incident status changes.

Use patterns to isolate behavior the project needs; avoid classes added only
for a pattern label.
