# I-ITSM v1.1

Intelligent IT Service Management & Incident Resolution System for reporting,
prioritizing, assigning, and tracking internal IT incidents.

## Project structure

- `backend/` — Java 17 and Spring Boot REST API, domain services, persistence,
  security, and automated tests.
- `frontend/` — React and Vite application.
- `docs/` — Project brief, requirements, architecture, and delivery checklist.
- No-card demo deployment and hosting limits are in `docs/deployment.md`.

## Run locally

Requirements: Java 17+, Node.js/npm, and PostgreSQL.

1. Put backend environment variables in the ignored root `.env` file. The
   `scripts/run-backend.ps1` helper loads them before starting Spring Boot.
2. Configure PostgreSQL connection details in `.env`.
3. Start the API with `./scripts/run-backend.ps1` (Windows PowerShell).
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
