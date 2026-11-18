# Project documentation

## Source of truth

`OOP_S1_2026-2027_Project.pdf` is the course brief. The written functional
requirements and business rules are in
`requirements.md`. This repository
implements the agreed React, Spring Boot, and PostgreSQL stack; the course brief
allows teams to choose and justify their own technologies.

## Required submission contents

1. Problem analysis: problem, stakeholders, challenges, solution, and
   assumptions.
2. Requirements: functional and non-functional requirements, roles, and
   business rules.
3. System architecture diagram showing components and interactions.
4. UML use case and class diagrams, including OOP relationships and patterns.
5. Technology stack selection and justification, alternatives, limits, and
   scalability discussion.
6. Complete source code in the version-control repository.
7. Database design: ER diagram, schema, relationships, and sample data.
8. At least 15 meaningful documented test cases, including normal, boundary,
   invalid-input, exception, authorization, and business-rule cases.
9. A 15–20 minute recorded demo with all team members and at least three
   complete workflows.

The hard submission deadline stated in the brief is 22 November 2026.

## Suggested demo workflows

- Employee reports an incident; the system calculates priority, assigns a
  technician, and creates notifications.
- Technician acknowledges and investigates; SLA status updates; technician
  resolves; reporter verifies and closes.
- Similar incidents are detected and linked; SLA monitoring raises a warning
  or breach and escalation is recorded.
- The incident form suggests relevant past resolutions, explains the priority
  score, and offers the rule-based Desk Buddy for status and SLA questions.

## Submission documents

- [Requirements and problem analysis](requirements.md)
- [Architecture and UML diagrams](architecture-and-uml.md)
- [Technology selection and security notes](technology-selection.md)
- [Database design](database-design.md)
- [Test plan and demo run of show](testing-and-demo.md)
- [Development guidelines](development-guidelines.md)

## Repository notes

- `backend/src/main/java/com/iitsm/` is organized by feature; keep controllers,
  services, persistence, DTOs, and domain types in their existing feature
  packages.
- `frontend/src/` currently has pages, shared components, and API/WebSocket
  services. As features grow, group reusable components and API modules by
  feature without moving files until imports and ownership are clear.
- Runtime credentials belong in local environment files or a secret manager,
  never in version control.
