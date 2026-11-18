# I-ITSM v1.1

Intelligent IT Service Management & Incident Resolution System for reporting,
prioritizing, assigning, and tracking internal IT incidents.

## Project structure

- `backend/` — Java 17 and Spring Boot REST API, domain services, persistence,
  security, and automated tests.
- `frontend/` — React and Vite application.
- `docs/` — Project brief, requirements, architecture, and delivery checklist.
- Firebase Hosting and desktop/mobile packaging instructions are in
  `docs/deployment.md`.

## Run locally

Requirements: Java 17+, Node.js/npm, and PostgreSQL.

1. Configure backend environment variables using `backend/.env.example`.
2. Create a PostgreSQL database and set its connection details.
3. Start the API from `backend/` with `./mvnw spring-boot:run` (Windows:
   `mvnw.cmd spring-boot:run`).
4. Install frontend dependencies from `frontend/` with `npm ci`, then run
   `npm run dev`.

Never commit `.env` files, service account keys, or real credentials.

## Current implementation areas

The backend contains user authentication and technician assignment, priority
calculation, SLA monitoring and escalation, duplicate detection, service
catalog, audit logging, notifications, and dashboard analytics. The frontend
contains login/registration, manager dashboard, service management, technician
directory, audit log, and notification views. See `docs/` for project scope
and the remaining course deliverables.
