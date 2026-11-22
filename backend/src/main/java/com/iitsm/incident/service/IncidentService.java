
package com.iitsm.incident.service;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.IncidentStatus;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.enums.UserRole;
import com.iitsm.core.exception.IitsmException;
import com.iitsm.core.exception.ResourceNotFoundException;
import com.iitsm.core.exception.UnauthorizedOperationException;
import com.iitsm.core.model.User;
import com.iitsm.duplicate.DuplicateMatch;
import com.iitsm.duplicate.SimilarityStrategy;
import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentEventPublisher;
import com.iitsm.incident.dto.IncidentCommentResponse;
import com.iitsm.incident.dto.IncidentCreateRequest;
import com.iitsm.incident.dto.IncidentResponse;
import com.iitsm.incident.dto.ResolutionSuggestionRequest;
import com.iitsm.incident.dto.ResolutionSuggestionResponse;
import com.iitsm.priority.PriorityService;
import com.iitsm.servicecatalog.repository.ServiceCatalogRepository;
import com.iitsm.user.repository.UserRepository;
import com.iitsm.user.service.TechnicianAssignmentService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class IncidentService {

    private static final String SELECT = """
            SELECT i.id, i.tracking_number, i.title, i.description, i.service_id,
                   s.name AS service_name, i.category, i.urgency, i.impact, i.priority,
                   i.priority_score, s.criticality_factor, s.base_sla_weight,
                   i.status, i.reporter_id, reporter.full_name AS reporter_name,
                   i.assigned_technician_id AS technician_id, technician.full_name AS technician_name,
                   i.primary_incident_id, i.is_potential_duplicate, i.sla_breached,
                   i.response_deadline, i.resolution_deadline, i.assigned_at, i.acknowledged_at,
                   i.resolved_at, i.closed_at, i.created_at, i.updated_at,
                   i.resolution_notes, i.root_cause
              FROM incidents i
              LEFT JOIN services s ON s.id = i.service_id
              LEFT JOIN users reporter ON reporter.id = i.reporter_id
              LEFT JOIN users technician ON technician.id = i.assigned_technician_id
            """;

    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate namedJdbc;
    private final UserRepository users;
    private final ServiceCatalogRepository services;
    private final TechnicianAssignmentService assignmentService;
    private final PriorityService priorityService;
    private final IncidentEventPublisher eventPublisher;
    private final IncidentLifecycle lifecycle;
    private final SimilarityStrategy similarity;

    public IncidentService(JdbcTemplate jdbc, NamedParameterJdbcTemplate namedJdbc,
                           UserRepository users, ServiceCatalogRepository services,
                           TechnicianAssignmentService assignmentService,
                           PriorityService priorityService, IncidentEventPublisher eventPublisher,
                           IncidentLifecycle lifecycle, SimilarityStrategy similarity) {
        this.jdbc = jdbc;
        this.namedJdbc = namedJdbc;
        this.users = users;
        this.services = services;
        this.assignmentService = assignmentService;
        this.priorityService = priorityService;
        this.eventPublisher = eventPublisher;
        this.lifecycle = lifecycle;
        this.similarity = similarity;
    }

    @Transactional
    public IncidentResponse create(IncidentCreateRequest request, String email) {
        User reporter = requireUser(email);
        lifecycle.transition("NEW", "CLASSIFIED");

        var service = services.findById(request.serviceId())
                .orElseThrow(() -> new IitsmException("Affected service was not found"));

        Priority priority = priorityService.determine(request.impact(), request.urgency(),
                service.getCriticalityFactor(), service.getBaseSlaWeight());

        var priorityScore = priorityService.score(request.impact(), request.urgency(),
                service.getCriticalityFactor(), service.getBaseSlaWeight());

        int[] sla = slaTargets(priority);
        Instant now = Instant.now();

        String trackingNumber = "INC-%s-%s".formatted(
                DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC).format(now),
                UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));

        List<IncidentResponse> duplicateCandidates = findRecentDuplicates(
                request.serviceId(), request.title(), request.description(), now);

        Long parentId = duplicateCandidates.isEmpty() ? null :
                duplicateCandidates.get(0).primaryIncidentId() != null
                        ? duplicateCandidates.get(0).primaryIncidentId()
                        : duplicateCandidates.get(0).id();

        Instant responseDeadline = now.plusSeconds(sla[0] * 60L);
        Instant resolutionDeadline = now.plusSeconds(sla[1] * 60L);

        jdbc.update("""
                INSERT INTO incidents (tracking_number, title, description, service_id, category, urgency,
                  impact, priority, priority_score, status, reporter_id, primary_incident_id, is_potential_duplicate,
                  response_deadline, resolution_deadline, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                trackingNumber, request.title().trim(), request.description().trim(), request.serviceId(),
                request.category().name(), request.urgency().name(), request.impact().name(), priority.name(),
                priorityScore, IncidentStatus.CLASSIFIED.name(), reporter.getId(), parentId, parentId != null,
                Timestamp.from(responseDeadline), Timestamp.from(resolutionDeadline),
                Timestamp.from(now), Timestamp.from(now));

        Long id = jdbc.queryForObject(
                "SELECT id FROM incidents WHERE tracking_number = ?", Long.class, trackingNumber);

        Long assignedTechnicianId = null;
        String assignedTechnicianEmail = null;

        var technicianOpt = assignmentService.findTechnician(request.category(), priority);

        if (technicianOpt.isPresent()) {
            var technician = technicianOpt.get();
            lifecycle.transition("CLASSIFIED", "ASSIGNED");

            jdbc.update("""
                    UPDATE incidents
                    SET assigned_technician_id=?, status='ASSIGNED', assigned_at=?, updated_at=?
                    WHERE id=?
                    """,
                    technician.getId(), Timestamp.from(now), Timestamp.from(now), id);

            assignedTechnicianId = technician.getId();
            assignedTechnicianEmail = technician.getEmail();
        }

        publishEvent(id, trackingNumber, reporter, "INCIDENT_CREATED", "INCIDENT_CREATED",
                "NEW", "CLASSIFIED",
                parentId == null ? "Incident reported and classified."
                        : "Potential duplicate of incident #" + parentId,
                reporter.getId(), reporter.getEmail());

        if (assignedTechnicianId != null) {
            publishEvent(id, trackingNumber, reporter,
                    "INCIDENT_ASSIGNED", "INCIDENT_ASSIGNED", "CLASSIFIED", "ASSIGNED",
                    "Incident assigned to technician #" + assignedTechnicianId,
                    assignedTechnicianId, assignedTechnicianEmail);
        }

        return getById(id, reporter);
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> search(String email, String id, LocalDate dateFrom, LocalDate dateTo,
            String status, String priority, Long serviceId, Long technicianId, String slaStatus) {
        return search(email, id, dateFrom, dateTo, status, priority, null, serviceId, technicianId, slaStatus);
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> search(String email, String id, LocalDate dateFrom, LocalDate dateTo,
            String status, String priority, String category, Long serviceId, Long technicianId, String slaStatus) {
        if (dateFrom != null && dateTo != null && dateFrom.isAfter(dateTo))
            throw new IitsmException("Start date must be on or before end date");

        User actor = requireUser(email);

        StringBuilder sql = new StringBuilder(SELECT).append(" WHERE 1=1 ");
        MapSqlParameterSource params = new MapSqlParameterSource();

        if (actor.getRole() == UserRole.ROLE_EMPLOYEE) {
            sql.append(" AND i.reporter_id = :actorId");
            params.addValue("actorId", actor.getId());
        } else if (actor.getRole() == UserRole.ROLE_TECHNICIAN) {
            sql.append(" AND (i.assigned_technician_id = :actorId OR i.reporter_id = :actorId)");
            params.addValue("actorId", actor.getId());
        }

        if (id != null && !id.isBlank()) {
            sql.append(" AND (CAST(i.id AS TEXT) = :incidentId OR i.tracking_number ILIKE :tracking)");
            params.addValue("incidentId", id.trim());
            params.addValue("tracking", "%" + id.trim() + "%");
        }

        if (dateFrom != null) {
            sql.append(" AND i.created_at >= :fromDate");
            params.addValue("fromDate",
                    Timestamp.from(dateFrom.atStartOfDay().toInstant(ZoneOffset.UTC)));
        }

        if (dateTo != null) {
            sql.append(" AND i.created_at < :toDate");
            params.addValue("toDate",
                    Timestamp.from(dateTo.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)));
        }

        if (status != null && !status.isBlank()) {
            sql.append(" AND i.status = :status");
            params.addValue("status", status);
        }

        if (priority != null && !priority.isBlank()) {
            sql.append(" AND i.priority = :priority");
            params.addValue("priority", priority);
        }

        if (category != null && !category.isBlank()) {
            sql.append(" AND i.category = :category");
            params.addValue("category", category.trim());
        }

        if (serviceId != null) {
            sql.append(" AND i.service_id = :serviceId");
            params.addValue("serviceId", serviceId);
        }

        if (technicianId != null) {
            sql.append(" AND i.assigned_technician_id = :technicianId");
            params.addValue("technicianId", technicianId);
        }
        if (slaStatus != null && !slaStatus.isBlank()) {
            sql.append(switch (slaStatus) {
                case "BREACHED" -> " AND i.sla_breached = TRUE";
                case "WARNING" -> " AND i.sla_breached = FALSE AND i.status NOT IN ('VERIFIED','CLOSED') AND ((i.acknowledged_at IS NULL AND CURRENT_TIMESTAMP >= i.response_deadline - ((i.response_deadline - i.created_at) * 0.25)) OR (i.resolved_at IS NULL AND CURRENT_TIMESTAMP >= i.resolution_deadline - ((i.resolution_deadline - i.created_at) * 0.25)))";
                case "NORMAL" -> " AND i.sla_breached = FALSE AND NOT (i.status NOT IN ('VERIFIED','CLOSED') AND ((i.acknowledged_at IS NULL AND CURRENT_TIMESTAMP >= i.response_deadline - ((i.response_deadline - i.created_at) * 0.25)) OR (i.resolved_at IS NULL AND CURRENT_TIMESTAMP >= i.resolution_deadline - ((i.resolution_deadline - i.created_at) * 0.25))))";
                default -> throw new IitsmException("Unsupported SLA status filter");
            });
        }

        sql.append(" ORDER BY i.created_at DESC LIMIT 200");

        return namedJdbc.query(sql.toString(), params, this::mapIncident);
    }

    @Transactional(readOnly = true)
    public IncidentResponse get(Long id, String email) {
        return getById(id, requireUser(email));
    }

    @Transactional
    public IncidentResponse verify(Long id, String email) {
        User actor = requireUser(email);
        IncidentResponse incident = getById(id, actor);

        lifecycle.transition(incident.status(), "VERIFIED");

        if (actor.getRole() != UserRole.ROLE_ADMIN && !incident.reporterId().equals(actor.getId()))
            throw new UnauthorizedOperationException(
                    "Only the reporting employee or an Administrator can verify this incident");

        changeStatus(id, actor, "VERIFIED", "INCIDENT_VERIFIED");
        return getById(id, actor);
    }

    @Transactional
    public IncidentResponse close(Long id, String email) {
        User actor = requireUser(email);
        IncidentResponse incident = getById(id, actor);

        lifecycle.transition(incident.status(), "CLOSED");

        if (actor.getRole() != UserRole.ROLE_ADMIN && !incident.reporterId().equals(actor.getId()))
            throw new UnauthorizedOperationException(
                    "Only the reporting employee or an Administrator can close this incident");

        jdbc.update("""
                UPDATE incidents
                SET status='CLOSED', closed_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
                """, id);

        publishEvent(id, incident.trackingNumber(), actor,
                "INCIDENT_CLOSED", "INCIDENT_CLOSED", "VERIFIED", "CLOSED",
                "Incident closed after verification.",
                incident.technicianId(), emailFor(incident.technicianId()));

        return getById(id, actor);
    }

    @Transactional
    public IncidentResponse acknowledge(Long id, String email) {
        User actor = requireUser(email);
        IncidentResponse incident = getById(id, actor);

        requireAssignedTechnician(incident, actor);
        lifecycle.transition(incident.status(), "ACKNOWLEDGED");

        jdbc.update("""
                UPDATE incidents
                SET status='ACKNOWLEDGED', acknowledged_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
                """, id);

        publishEvent(id, incident.trackingNumber(), actor,
                "INCIDENT_ACKNOWLEDGED", "INCIDENT_ACKNOWLEDGED", "ASSIGNED", "ACKNOWLEDGED",
                "Technician acknowledged the incident.", incident.reporterId(), null);

        return getById(id, actor);
    }

    @Transactional
    public IncidentResponse investigate(Long id, String email) {
        User actor = requireUser(email);
        IncidentResponse incident = getById(id, actor);

        requireAssignedTechnician(incident, actor);
        lifecycle.transition(incident.status(), "IN_PROGRESS");

        jdbc.update("""
                UPDATE incidents
                SET status='IN_PROGRESS', updated_at=CURRENT_TIMESTAMP
                WHERE id=?
                """, id);

        publishEvent(id, incident.trackingNumber(), actor,
                "INVESTIGATION_STARTED", "INVESTIGATION_STARTED", "ACKNOWLEDGED", "IN_PROGRESS",
                "Technician started investigation.", incident.reporterId(), null);

        return getById(id, actor);
    }

    @Transactional
    public IncidentResponse resolve(Long id, String resolutionNotes, String rootCause, String email) {
        User actor = requireUser(email);
        IncidentResponse incident = getById(id, actor);

        requireAssignedTechnician(incident, actor);
        lifecycle.transition(incident.status(), "RESOLVED");

        if (resolutionNotes == null || resolutionNotes.isBlank()
                || rootCause == null || rootCause.isBlank())
            throw new IitsmException("Resolution notes and root-cause details are required");

        jdbc.update("""
                UPDATE incidents
                SET status='RESOLVED', resolution_notes=?, root_cause=?,
                    resolved_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
                """,
                resolutionNotes.trim(), rootCause.trim(), id);

        publishEvent(id, incident.trackingNumber(), actor,
                "INCIDENT_RESOLVED", "INCIDENT_RESOLVED", "IN_PROGRESS", "RESOLVED",
                "Resolution recorded.", incident.reporterId(), null);

        return getById(id, actor);
    }

    @Transactional
    public IncidentResponse assign(Long id, String email) {
        User actor = requireUser(email);

        if (actor.getRole() != UserRole.ROLE_ADMIN && actor.getRole() != UserRole.ROLE_TEAM_LEAD)
            throw new UnauthorizedOperationException(
                    "Only a Team Lead or Administrator can assign incidents");

        IncidentResponse incident = getById(id, actor);
        lifecycle.transition(incident.status(), "ASSIGNED");

        var technician = assignmentService.selectTechnician(
                com.iitsm.core.enums.IncidentCategory.valueOf(incident.category()),
                Priority.valueOf(incident.priority()));

        jdbc.update("""
                UPDATE incidents
                SET assigned_technician_id=?, assigned_at=CURRENT_TIMESTAMP,
                    status='ASSIGNED', updated_at=CURRENT_TIMESTAMP
                WHERE id=?
                """, technician.getId(), id);

        publishEvent(id, incident.trackingNumber(), actor,
                "INCIDENT_ASSIGNED", "INCIDENT_ASSIGNED", "CLASSIFIED", "ASSIGNED",
                "Incident assigned to technician #" + technician.getId(),
                technician.getId(), technician.getEmail());

        return getById(id, actor);
    }

    @Transactional
    public IncidentResponse cancel(Long id, String email) {
        User actor = requireUser(email);
        IncidentResponse incident = getById(id, actor);

        if (actor.getRole() != UserRole.ROLE_EMPLOYEE
                || !actor.getId().equals(incident.reporterId())) {
            throw new UnauthorizedOperationException(
                    "Only the employee who reported this incident can cancel it");
        }

        if (!"CLASSIFIED".equals(incident.status()) || incident.technicianId() != null) {
            throw new IitsmException("Only unassigned incidents can be cancelled");
        }

        lifecycle.transition(incident.status(), "CANCELLED");

        int updated = jdbc.update(
                "UPDATE incidents SET status='CANCELLED', updated_at=CURRENT_TIMESTAMP " +
                        "WHERE id=? AND reporter_id=? AND status='CLASSIFIED' " +
                        "AND assigned_technician_id IS NULL",
                id, actor.getId());

        if (updated != 1) {
            throw new IitsmException("This incident can no longer be cancelled");
        }

        publishEvent(id, incident.trackingNumber(), actor,
                "INCIDENT_CANCELLED", "INCIDENT_CANCELLED", "CLASSIFIED", "CANCELLED",
                "Incident cancelled by its reporting employee.",
                null, null);

        return getById(id, actor);
    }

    @Transactional(readOnly = true)
    public List<IncidentCommentResponse> comments(Long id, String email) {
        User actor = requireUser(email);
        getById(id, actor);

        return jdbc.query("""
                SELECT c.id, c.incident_id, c.author_id, u.full_name, c.message, c.created_at
                FROM incident_comments c JOIN users u ON u.id=c.author_id
                WHERE c.incident_id=? ORDER BY c.created_at
                """,
                (rs, n) -> new IncidentCommentResponse(
                        rs.getLong(1), rs.getLong(2), rs.getLong(3),
                        rs.getString(4), rs.getString(5), rs.getTimestamp(6).toInstant()),
                id);
    }

    @Transactional
    public IncidentCommentResponse addComment(Long id, String message, String email) {
        User actor = requireUser(email);
        IncidentResponse before = getById(id, actor);

        if ("CLOSED".equals(before.status()))
            throw new IitsmException("Closed incidents do not accept further updates");

        if (message == null || message.isBlank())
            throw new IitsmException("Update message is required");

        Long commentId = jdbc.queryForObject("""
                INSERT INTO incident_comments (incident_id, author_id, message)
                VALUES (?, ?, ?) RETURNING id
                """, Long.class, id, actor.getId(), message.trim());

        jdbc.update("UPDATE incidents SET updated_at=CURRENT_TIMESTAMP WHERE id=?", id);

        IncidentCommentResponse response = jdbc.queryForObject("""
                SELECT c.id,c.incident_id,c.author_id,u.full_name,c.message,c.created_at
                FROM incident_comments c JOIN users u ON u.id=c.author_id WHERE c.id=?
                """,
                (rs, n) -> new IncidentCommentResponse(
                        rs.getLong(1), rs.getLong(2), rs.getLong(3),
                        rs.getString(4), rs.getString(5), rs.getTimestamp(6).toInstant()),
                commentId);

        IncidentResponse incident = getById(id, actor);
        Long recipient = actor.getId().equals(incident.reporterId())
                ? incident.technicianId() : incident.reporterId();

        publishEvent(id, incident.trackingNumber(), actor,
                "INCIDENT_UPDATED", "INCIDENT_UPDATED", incident.status(), incident.status(),
                "An incident update was added.", recipient, null);

        return response;
    }

    // Holds a candidate incident and its already-computed similarity score.
    private record ScoredIncident(IncidentResponse incident, double score) {}

    private List<ScoredIncident> findRecentDuplicateMatches(
            Long serviceId, String title, String description, Instant now) {

        List<IncidentResponse> candidates = jdbc.query(
                SELECT + " WHERE i.service_id=? AND i.created_at >= ? " +
                        "AND i.status NOT IN ('RESOLVED','VERIFIED','CLOSED','CANCELLED') " +
                        "ORDER BY i.created_at DESC",
                this::mapIncident, serviceId, Timestamp.from(now.minusSeconds(86400)));

        String query = title + " " + description;

        return candidates.stream()
                .map(candidate -> new ScoredIncident(
                        candidate,
                        similarity.similarity(
                                query,
                                candidate.title() + " " + candidate.description())))
                .filter(match -> match.score() >= 0.80)
                .sorted(java.util.Comparator.comparingDouble(
                        ScoredIncident::score).reversed())
                .toList();
    }

    private List<IncidentResponse> findRecentDuplicates(
            Long serviceId, String title, String description, Instant now) {

        return findRecentDuplicateMatches(serviceId, title, description, now)
                .stream()
                .map(ScoredIncident::incident)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DuplicateMatch> checkDuplicates(
            Long serviceId, String title, String description) {

        if (services.findById(serviceId).isEmpty())
            throw new ResourceNotFoundException("Service", serviceId);

        if (title == null || title.isBlank()
                || description == null || description.isBlank())
            throw new IitsmException(
                    "Title and description are required for duplicate detection");

        return findRecentDuplicateMatches(
                serviceId, title, description, Instant.now())
                .stream()
                .map(match -> new DuplicateMatch(
                        match.incident().id(),
                        match.incident().title(),
                        match.score()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ResolutionSuggestionResponse> recommendResolutions(
            ResolutionSuggestionRequest request, String email) {

        User actor = requireUser(email);

        if (services.findById(request.serviceId()).isEmpty())
            throw new ResourceNotFoundException("Service", request.serviceId());

        String scope = actor.getRole() == UserRole.ROLE_EMPLOYEE
                ? " AND reporter_id = ?"
                : actor.getRole() == UserRole.ROLE_TECHNICIAN
                ? " AND (assigned_technician_id = ? OR reporter_id = ?)"
                : "";

        String sql = """
                SELECT category, priority, title, description, resolution_notes, root_cause
                  FROM incidents
                 WHERE service_id = ? AND category = ?
                   AND status IN ('RESOLVED','VERIFIED','CLOSED')
                   AND resolution_notes IS NOT NULL AND LENGTH(TRIM(resolution_notes)) > 0
                """ + scope + " ORDER BY resolved_at DESC NULLS LAST LIMIT 300";

        Object[] params = actor.getRole() == UserRole.ROLE_EMPLOYEE
                ? new Object[]{request.serviceId(), request.category().name(), actor.getId()}
                : actor.getRole() == UserRole.ROLE_TECHNICIAN
                ? new Object[]{request.serviceId(), request.category().name(),
                        actor.getId(), actor.getId()}
                : new Object[]{request.serviceId(), request.category().name()};

        String query = request.title() + " " + request.description();

        return jdbc.query(sql, (rs, row) -> {
                    String text = rs.getString("title") + " " + rs.getString("description");

                    return new ResolutionSuggestionResponse(
                            rs.getString("category"), rs.getString("priority"),
                            rs.getString("resolution_notes"), rs.getString("root_cause"),
                            similarity.similarity(query, text));
                }, params).stream()
                .filter(suggestion -> suggestion.similarity() >= 0.18)
                .sorted(java.util.Comparator.comparingDouble(
                        ResolutionSuggestionResponse::similarity).reversed())
                .limit(3)
                .toList();
    }

    private int[] slaTargets(Priority priority) {
        List<int[]> targets = jdbc.query(
                "SELECT response_target_minutes,resolution_target_minutes FROM sla_policies WHERE priority=?",
                (rs, row) -> new int[]{rs.getInt(1), rs.getInt(2)},
                priority.name());

        if (targets.isEmpty())
            throw new IitsmException("No SLA policy configured for priority " + priority);

        return targets.get(0);
    }

    private IncidentResponse getById(Long id, User actor) {
        String scope = actor.getRole() == UserRole.ROLE_EMPLOYEE
                ? " AND i.reporter_id=?"
                : actor.getRole() == UserRole.ROLE_TECHNICIAN
                ? " AND (i.assigned_technician_id=? OR i.reporter_id=?)"
                : "";

        List<IncidentResponse> found = scope.isEmpty()
                ? jdbc.query(SELECT + " WHERE i.id=?", this::mapIncident, id)
                : actor.getRole() == UserRole.ROLE_TECHNICIAN
                ? jdbc.query(SELECT + " WHERE i.id=?" + scope,
                        this::mapIncident, id, actor.getId(), actor.getId())
                : jdbc.query(SELECT + " WHERE i.id=?" + scope,
                        this::mapIncident, id, actor.getId());

        if (found.isEmpty()) {
            IncidentResponse exists = jdbc.query(
                    SELECT + " WHERE i.id=?", this::mapIncident, id)
                    .stream().findFirst().orElse(null);

            if (exists == null)
                throw new ResourceNotFoundException("Incident", id);

            throw new UnauthorizedOperationException(
                    "You are not allowed to access this incident");
        }

        return found.get(0);
    }

    private User requireUser(String email) {
        return users.findByEmail(email)
                .orElseThrow(() -> new IitsmException(
                        "Authenticated account was not found"));
    }

    private String emailFor(Long userId) {
        return userId == null ? null
                : users.findById(userId).map(User::getEmail).orElse(null);
    }

    private void changeStatus(Long id, User actor, String status, String action) {
        jdbc.update(
                "UPDATE incidents SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
                status, id);

        IncidentResponse incident = getById(id, actor);

        publishEvent(id, incident.trackingNumber(), actor, action, action,
                "RESOLVED", status, "Incident status changed to " + status + ".",
                incident.technicianId(), null);
    }

    private void requireAssignedTechnician(IncidentResponse incident, User actor) {
        if (actor.getRole() != UserRole.ROLE_TECHNICIAN
                || !actor.getId().equals(incident.technicianId())) {
            throw new UnauthorizedOperationException(
                    "Only the assigned technician can perform this action");
        }
    }

    private void publishEvent(Long id, String trackingNumber, User actor,
                              String eventType, String action, String previous,
                              String next, String description,
                              Long recipientId, String recipientEmail) {

        eventPublisher.publishEvent(IncidentEvent.builder()
                .eventType(eventType)
                .incidentId(id)
                .trackingNumber(trackingNumber)
                .actorId(actor.getId())
                .actorName(actor.getFullName())
                .actorRole(actor.getRole().name())
                .action(action)
                .previousState(previous)
                .newState(next)
                .title(description)
                .description(description)
                .recipientId(recipientId)
                .recipientEmail(recipientEmail)
                .timestamp(Instant.now())
                .build());
    }

    private IncidentResponse mapIncident(ResultSet rs, int row) throws SQLException {
        return new IncidentResponse(
                rs.getLong("id"),
                rs.getString("tracking_number"),
                rs.getString("title"),
                rs.getString("description"),
                (Long) rs.getObject("service_id"),
                rs.getString("service_name"),
                rs.getString("category"),
                rs.getString("urgency"),
                rs.getString("impact"),
                rs.getString("priority"),
                rs.getBigDecimal("priority_score"),
                rs.getBigDecimal("criticality_factor"),
                (Integer) rs.getObject("base_sla_weight"),
                rs.getString("status"),
                (Long) rs.getObject("reporter_id"),
                rs.getString("reporter_name"),
                (Long) rs.getObject("technician_id"),
                rs.getString("technician_name"),
                (Long) rs.getObject("primary_incident_id"),
                rs.getBoolean("is_potential_duplicate"),
                rs.getBoolean("sla_breached"),
                instant(rs, "response_deadline"),
                instant(rs, "resolution_deadline"),
                instant(rs, "assigned_at"),
                instant(rs, "acknowledged_at"),
                instant(rs, "resolved_at"),
                instant(rs, "closed_at"),
                instant(rs, "created_at"),
                instant(rs, "updated_at"),
                rs.getString("resolution_notes"),
                rs.getString("root_cause"));
    }

    private Instant instant(ResultSet rs, String column) throws SQLException {
        var value = rs.getTimestamp(column);
        return value == null ? null : value.toInstant();
    }
}
