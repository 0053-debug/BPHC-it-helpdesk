# Test plan and recorded demonstration

## Documented test cases

| # | Area | Scenario | Expected result |
|---:|---|---|---|
| 1 | Authentication | Login with a valid account | JWT returned; password never appears in response |
| 2 | Authentication | Login with wrong password | HTTP 401; no account detail leaked |
| 3 | Authorization | Employee requests another employee's incident | HTTP 403 or scoped not-found response |
| 4 | Creation | Required title, description, service, category, impact, urgency supplied | Incident persisted with generated ID and UTC creation time |
| 5 | Validation | Missing title or unknown service | HTTP 400; no incident row created |
| 6 | Priority | Impact 4, urgency 4, factor 2.0, service weight 4 | Score 36 and P1 |
| 7 | Priority boundary | Formula score 24 | P1; score 23.99 maps to P2 |
| 8 | Assignment | Available technician with matching skill and capacity | Strategy selects eligible technician; status becomes ASSIGNED |
| 9 | Assignment boundary | All matching technicians at capacity or unavailable | Incident remains CLASSIFIED; no invalid assignment |
| 10 | Lifecycle | Assigned technician acknowledges then investigates | Status moves ASSIGNED → ACKNOWLEDGED → IN_PROGRESS |
| 11 | Lifecycle exception | Technician attempts to resolve before investigation or skips a state | Request rejected; state unchanged |
| 12 | Resolution | Resolve without notes or root cause | Validation error; status remains IN_PROGRESS |
| 13 | Employee verification | Reporter verifies RESOLVED incident then closes VERIFIED incident | Status progresses RESOLVED → VERIFIED → CLOSED |
| 14 | Closure immutability | Attempt state change or update after CLOSED | Request rejected; incident remains unchanged |
| 15 | Duplicate scope | Similar title/description, same service, active incident, within 24 hours, score ≥0.80 | New record flagged and linked to primary incident |
| 16 | Duplicate exclusion | Similar text on different service, older than 24 hours, or closed incident | No duplicate link |
| 17 | Search | Filter by ID/date/status/priority/service/technician/SLA status | Only matching, role-visible records returned |
| 18 | SLA warning | Open incident reaches 75% of response or resolution window | One warning, audit entry, and notification emitted |
| 19 | SLA breach | Deadline passes | Violation persisted once, incident breach flag set, audit entry created |
| 20 | Escalation | P1 unacknowledged 5 minutes after assignment | Team Lead escalation recorded once |
| 21 | Escalation | P1 unresolved at 75% of resolution target | Administrator escalation recorded once |
| 22 | Updates | Reporter or assigned technician posts an update | Update persists with author/time and appears in incident history |

These are planned/documented cases. Mark execution status and attach evidence
when the team runs them against the final integrated database and UI.

## Demo run of show (18 minutes)

All four team members should introduce themselves and explain one module. Use
local demo accounts created from private environment variables; do not include
passwords in the recording or report.

| Time | Presenter | Screen and workflow |
|---|---|---|
| 00:00–01:30 | All | Introductions, problem statement, project scope, stack and architecture |
| 01:30–06:00 | Member 1 | Workflow 1: employee reports network incident; show calculated priority, SLA targets, duplicate link if present, and assignment |
| 06:00–10:30 | Member 2 | Workflow 2: assigned technician acknowledges, starts investigation, posts update, records root cause/resolution; reporter verifies and closes |
| 10:30–14:30 | Member 3 | Show search filters, workload/priority strategies, simulate SLA warning/breach and demonstrate the two P1 escalation milestones |
| 14:30–17:00 | Member 4 | Workflow 3: report similar incident; show same-service, 24-hour duplicate correlation, audit history, and notification delivery |
| 17:00–18:00 | All | Testing evidence, design-pattern rationale, limitations, and closing |

Before recording, reset sample records, confirm the mail/push integrations are
either configured or clearly shown in simulation mode, and prepare an
unacknowledged P1 plus a similar incident so timer-based behavior is visible.
