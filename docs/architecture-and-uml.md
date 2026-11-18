# Architecture and UML

## System architecture

```mermaid
flowchart LR
  Employee[Employee browser]
  Staff[Technician / Lead / Admin browser]
  React[React + Vite frontend]
  Security[Spring Security + JWT]
  API[Spring Boot REST API]
  Incidents[Incident workflow service]
  Assignment[Assignment strategies]
  Priority[Weighted priority strategy]
  SLA[SLA monitor + escalation]
  Events[Incident event publisher]
  Data[(PostgreSQL)]
  Notify[In-app / WebSocket / email / optional FCM]
  Employee --> React
  Staff --> React
  React -->|REST + Bearer token| Security --> API
  API --> Incidents
  Incidents --> Priority
  Incidents --> Assignment
  Incidents --> Events
  SLA --> Data
  Incidents --> Data
  Events --> Data
  Events --> Notify
```

The application is a single Spring Boot API and a React client. PostgreSQL is
the system of record. REST requests carry signed JWTs; the backend derives the
actor from the authenticated identity and applies record-level ownership rules.
Incident state changes and their audit entries run in the same transaction.
The SLA scheduler reads open incidents on a 60-second cadence and records
warnings and breaches idempotently.

## Use case diagram

```mermaid
flowchart LR
  Employee([Employee])
  Technician([Technician])
  Lead([Team Lead])
  Admin([Administrator])
  subgraph System[I-ITSM]
    Report((Report incident))
    Own((View own incidents / updates))
    Verify((Verify and close resolution))
    Queue((View assigned queue))
    Work((Acknowledge, investigate, resolve))
    Assign((Assign / reassign incident))
    Configure((Configure service, SLA, strategy))
    Search((Search and filter incidents))
    Audit((Review audit / reports))
  end
  Employee --> Report
  Employee --> Own
  Employee --> Verify
  Technician --> Report
  Technician --> Queue
  Technician --> Work
  Technician --> Search
  Lead --> Assign
  Lead --> Audit
  Lead --> Search
  Admin --> Assign
  Admin --> Configure
  Admin --> Audit
  Admin --> Search
```

## Class diagram (principal design)

```mermaid
classDiagram
  class IncidentController {
    +create(request, principal)
    +search(filters, principal)
    +get(id, principal)
    +verify(id, principal)
    +close(id, principal)
  }
  class IncidentService {
    +create(request, email)
    +search(filters, email)
    +acknowledge(id, email)
    +investigate(id, email)
    +resolve(id, notes, cause, email)
    +verify(id, email)
    +close(id, email)
  }
  class AssignmentStrategy {
    <<interface>>
    +assign(category, technicians, workloads)
  }
  class SkillBasedAssignmentStrategy
  class LoadBasedAssignmentStrategy
  class PriorityAwareAssignmentStrategy
  class PriorityStrategy {
    <<interface>>
    +calculate(impact, urgency, criticality, weight)
  }
  class WeightedScorePriorityStrategy
  class IncidentEventPublisher {
    +publishEvent(event)
  }
  class AuditLogObserver
  class WebSocketNotificationObserver
  class IncidentLifecycle {
    +transition(current, target)
  }
  class IncidentStatus
  class User
  class Technician
  class ServiceEntity
  class SlaMonitorService
  class SlaViolation
  IncidentController --> IncidentService
  IncidentService --> AssignmentStrategy
  IncidentService --> PriorityStrategy
  IncidentService --> IncidentEventPublisher
  AssignmentStrategy <|.. SkillBasedAssignmentStrategy
  AssignmentStrategy <|.. LoadBasedAssignmentStrategy
  AssignmentStrategy <|.. PriorityAwareAssignmentStrategy
  PriorityStrategy <|.. WeightedScorePriorityStrategy
  IncidentEventPublisher --> AuditLogObserver
  IncidentEventPublisher --> WebSocketNotificationObserver
  User <|-- Technician
  IncidentService --> ServiceEntity
  SlaMonitorService --> SlaViolation
  IncidentLifecycle --> IncidentStatus
```

The backend persists incident rows through parameterized JDBC queries alongside
Spring Data JPA repositories for users, services, audit, notifications, and SLA
records. The Strategy Pattern chooses priority and technician selection; the
Observer Pattern sends audit and notification effects after domain operations.
The current incident persistence is intentionally described accurately: it is
JDBC-based, not a JPA `Incident` entity.

## Decision support and ticket chat

The priority panel shows the inputs used by the weighted score:
`impact × urgency × service criticality + service weight`, followed by the
configured P1–P4 score band. The incident form also compares its title and
description with resolved incidents for the same service and category. It ranks
up to three prior resolutions using the existing deterministic token similarity
strategy. Employees only receive suggestions from their own resolved tickets;
technicians receive suggestions from tickets they reported or were assigned;
leads and administrators can use the full history. Suggested resolution notes
are advisory and remain visible only to authenticated users in that scope.

Desk Buddy is a small browser-side, rule-based helper in the incident workspace.
It reads the already authorized incident list and selected incident to answer
status, assignment, SLA deadline, resolution, and next-step questions. It makes
no external model calls and does not create or change ticket data.
