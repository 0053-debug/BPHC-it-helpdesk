package com.iitsm.core.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.iitsm.core.exception.InvalidStateTransitionException;
import com.iitsm.core.state.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String incidentNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private IncidentCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status = IncidentStatus.NEW;

    @Transient
    @JsonIgnore
    private IncidentState state = new NewState();

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private Impact impact;

    @Enumerated(EnumType.STRING)
    private Urgency urgency;

    @Enumerated(EnumType.STRING)
    private SlaStatus slaStatus;

    private LocalDateTime acknowledgedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime responseDueAt;
    private LocalDateTime resolutionDueAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private Technician assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private ServiceEntity affectedService;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IncidentComment> comments = new ArrayList<>();

    public Incident() {
        this.incidentNumber = "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = IncidentStatus.NEW;
        this.state = new NewState();
    }

    @PostLoad
    private void initStateFromStatus() {
        if (this.status == null) {
            this.status = IncidentStatus.NEW;
        }
        this.state = switch (this.status) {
            case NEW -> new NewState();
            case CLASSIFIED -> new ClassifiedState();
            case ASSIGNED -> new AssignedState();
            case ACKNOWLEDGED -> new AcknowledgedState();
            case IN_PROGRESS -> new InProgressState();
            case RESOLVED -> new ResolvedState();
            case VERIFIED -> new VerifiedState();
            case CLOSED -> new ClosedState();
        };
    }

    private IncidentState getActiveState() {
        if (this.state == null) {
            initStateFromStatus();
        }
        return this.state;
    }

    public void changeState(IncidentState newState) {
        this.state = newState;
        this.status = newState.getStatus();
        this.updatedAt = LocalDateTime.now();
    }

    public void classify() { getActiveState().classify(this); }
    public void assign() { getActiveState().assign(this); }
    public void acknowledge() { getActiveState().acknowledge(this); }
    public void startInvestigation() { getActiveState().startInvestigation(this); }
    public void resolve(String notes) { getActiveState().resolve(this, notes); }
    public void verify() { getActiveState().verify(this); }
    public void close() { getActiveState().close(this); }

    public void addComment(IncidentComment comment) {
        if (this.status == IncidentStatus.CLOSED) {
            throw new InvalidStateTransitionException("Cannot add comments to a CLOSED incident.");
        }
        comment.setIncident(this);
        this.comments.add(comment);
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIncidentNumber() { return incidentNumber; }
    public void setIncidentNumber(String incidentNumber) { this.incidentNumber = incidentNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public IncidentCategory getCategory() { return category; }
    public void setCategory(IncidentCategory category) { this.category = category; }

    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) {
        this.status = status;
        initStateFromStatus();
    }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Impact getImpact() { return impact; }
    public void setImpact(Impact impact) { this.impact = impact; }

    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency; }

    public SlaStatus getSlaStatus() { return slaStatus; }
    public void setSlaStatus(SlaStatus slaStatus) { this.slaStatus = slaStatus; }

    public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public LocalDateTime getResponseDueAt() { return responseDueAt; }
    public void setResponseDueAt(LocalDateTime responseDueAt) { this.responseDueAt = responseDueAt; }

    public LocalDateTime getResolutionDueAt() { return resolutionDueAt; }
    public void setResolutionDueAt(LocalDateTime resolutionDueAt) { this.resolutionDueAt = resolutionDueAt; }

    public Technician getAssignee() { return assignee; }
    public void setAssignee(Technician assignee) { this.assignee = assignee; }

    public ServiceEntity getAffectedService() { return affectedService; }
    public void setAffectedService(ServiceEntity affectedService) { this.affectedService = affectedService; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<IncidentComment> getComments() { return comments; }
    public void setComments(List<IncidentComment> comments) { this.comments = comments; }
}