# Intelligent IT Service Management System (I-ITSM)

[![Build & Tests](https://img.shields.io/badge/Tests-75%2F75%20Passing-brightgreen?style=flat-square&logo=junit5)](https://github.com/0053-debug/BPHC-it-helpdesk)
[![Java](https://img.shields.io/badge/Java-17%20%7C%2025%20LTS-orange?style=flat-square&logo=openjdk)](https://adoptium.net)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-green?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue?style=flat-square&logo=react)](https://vitejs.dev)
[![Platforms](https://img.shields.io/badge/Platforms-Windows%20%7C%20Android%20%7C%20Web-purple?style=flat-square)]()
[![Course](https://img.shields.io/badge/BITS%20Pilani-CS%20F213%20OOP-red?style=flat-square)]()

---

## Executive Summary

The **Intelligent IT Service Management System (I-ITSM)** is an enterprise-grade ITIL-aligned campus service desk platform developed for the **BITS Pilani Hyderabad Campus (BPHC)** Object-Oriented Programming Course (**CS F213**).

Visit the website: https://bphc-it-helpdesk.web.app/ (For downloading the apps/using the web browser version)

## Run the backend on your computer (Windows)

The backend needs Java 17 or newer and a running PostgreSQL server. You do not
need to install Maven; the repository includes the Maven wrapper.

1. In PostgreSQL, create a database named `iitsm_db`.
2. From the project folder, make a local environment file if you do not already
   have one:

   ```powershell
   if (-not (Test-Path .env)) { Copy-Item backend/.env.example .env }
   ```

   Open `.env` and set your local PostgreSQL username and password, plus a
   private random `JWT_SECRET`. Keep this file on your computer; do not commit
   or share it.
3. Open PowerShell in the project folder and start the API:

   ```powershell
   .\scripts\run-backend.ps1
   ```

   The API runs at `http://localhost:8080`. Leave this window open while using
   the application. Press `Ctrl+C` to stop it.
4. Check that it is running by opening
   [http://localhost:8080/api/health](http://localhost:8080/api/health).

To run the web app against this local backend, open a second terminal, go to
`frontend`, run `npm ci` and `npm run dev`, then visit
`http://localhost:5173`. The development server sends API requests to the
backend on port 8080.

Modern campus and corporate IT environments face challenges with unorganized incident reporting, delayed technician dispatch, missed SLA commitments, cascading service outages, and uncoordinated resolutions. I-ITSM Dashboard addresses these challenges by delivering an end-to-end incident lifecycle management platform powered by clean Object-Oriented Design (OOD) patterns, automated SLA tracking, workload-balanced assignment strategies, Directed Acyclic Graph (DAG) service impact modeling, and an immutable PostgreSQL audit ledger.

The solution is distributed natively across **Windows Desktop (64-bit installer)**, **Android Mobile (APK)**, and a **Cloud Web Console**.

---

## Key System Architecture & OOP Design Patterns

I-ITSM is built upon enterprise software engineering principles and GoF (Gang of Four) Object-Oriented design patterns:

### 1. State Pattern (`IncidentLifecycle`)
- Enforces strict unidirectional state transitions for incidents:
  $$\text{LOGGED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{IN\_PROGRESS} \longrightarrow \text{RESOLVED} \longrightarrow \text{CLOSED}$$
- Eliminates invalid transition states (e.g., closing an unassigned ticket or moving an incident backwards from closed to logged without explicit reopening workflows).

### 2. Strategy Pattern
- **Priority Calculation Strategy (`PriorityCalculator`)**:
  - Dynamically calculates ticket priority ($P1$ Critical down to $P4$ Low) by evaluating impact scope, service criticality, and operational urgency matrix.
- **Technician Assignment Strategy (`AssignmentStrategy`)**:
  - Balances technician active ticket workload, category specialization (Hardware, Network, Software, Identity), and availability to assign incoming tickets automatically to the optimal technician.

### 3. Observer Pattern (`IncidentEventPublisher`)
- Decouples core incident mutation events from side-effects.
- When an incident changes state, is reassigned, or escalated, publisher broadcasts events to subscribed listeners:
  - **`AuditLoggingObserver`**: Generates append-only audit trail records.
  - **`NotificationObserver`**: Dispatches in-app alerts and notifications to assignees and reporters.
  - **`EmailNotificationObserver`**: Issues formatted email dispatches for critical $P1/P2$ alerts.

### 4. Directed Acyclic Graph (DAG) Dependency Engine
- Models campus IT infrastructure and services as a directed graph.
- Evaluates upstream service dependencies and computes downstream **Blast Radius** upon component failure.
- Employs Depth-First Search (DFS) cycle-detection to prevent circular service dependencies during configuration.

### 5. Algorithmic Duplicate Ticket Detection
- Performs tokenized text normalization and similarity analysis across recent active tickets.
- Flags potential duplicate incidents to prevent redundant technician dispatch and overlapping resolutions.

---

## Multi-Platform Distribution

I-ITSM is built to run across client environments with a single shared design system:

```
                          ┌───────────────────────────┐
                          │   Shared React 18 / Vite  │
                          │   Client Core Application │
                          └─────────────┬─────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│  Cloud Web App   │           │ Windows Desktop  │           │  Android Mobile  │
│  (Firebase CDN)  │           │ (Electron .exe)  │           │ (Capacitor .apk) │
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

1. **Cloud Web Application**:
   - High-performance Single Page Application (SPA) deployed on **Firebase Hosting**.
   - Landing page at root featuring application downloads, and an isolated Web Console workspace (`?app=console`) with direct authentication and ticket management.

2. **Windows Desktop App (`.exe`)**:
   - Standalone 64-bit desktop package built using **Electron Builder**.
   - Native OS window controls, system tray alerts, and isolated execution.

3. **Android Mobile App (`.apk`)**:
   - Hybrid mobile container generated using **Capacitor**.
   - Touch-optimized views, pull-to-refresh incident feeds, and mobile status updates.

*(Note: In accordance with course constraints, macOS and iOS platforms are intentionally excluded.)*

---

## Cloud Architecture & Production Deployment

- **Backend API**: Containerized Spring Boot service deployed on **Snapdeploy** with zero-auth `/health` and `/api/health` probes for automated orchestrator container lifecycle management.
- **Database**: Managed Serverless PostgreSQL provided by **Neon**, featuring a database-level trigger on the audit table that blocks `UPDATE` and `DELETE` operations to guarantee a 100% immutable audit log.
- **Frontend Hosting**: Globally distributed static assets and client routing served by **Firebase Hosting**.

---

## Technology Stack

- **Backend Framework**: Spring Boot 3.3.4 (Java 17 / Java 25 LTS compatible)
- **Security**: Spring Security 6, JJWT (HMAC-SHA256, 0.12.6), BCrypt
- **Persistence**: Spring Data JPA / Hibernate, HikariCP, PostgreSQL 16
- **Testing**: JUnit 5, Mockito, Spring Boot Test (75 automated tests)
- **Frontend Core**: React 18, Vite 5, Tailwind CSS, Lucide Icons, Axios
- **Desktop Wrapper**: Electron 31, Electron Builder
- **Mobile Wrapper**: Capacitor 6 (Android SDK)

---

## Verification & Academic Deliverables

- **Unit & Integration Tests**: 75 backend tests passing with zero failures.
- **Health & Readiness Endpoints**: Whitelisted `/`, `/health`, and `/api/health` returning `200 OK`.
- **Git Branch Hygiene**: Consolidated cleanly on `main` branch with zero dangling feature branches.
- **Audit Verification**: Database triggers reject any retroactive mutation of historical audit events.
- **Multi-Platform Packages**: Production Windows desktop executable and Android APK configurations validated.
