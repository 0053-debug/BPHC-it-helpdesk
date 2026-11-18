package OOPS_Project;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class Incident {
    private String id;
    private String title;
    private String description;
    private String category;
    private IncidentState state;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String assigneeId;
    private List<IncidentComment> comments; // New field

    public Incident(String title, String description, String category) {
        this.id = "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.title = title;
        this.description = description;
        this.category = category;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.state = new NewState();
        this.comments = new ArrayList<>(); // Initialize list
    }

    public void setState(IncidentState state) { 
        this.state = state; 
        this.updatedAt = LocalDateTime.now();
    }

    // Lifecycle delegates
    public void classify() { state.classify(this); }
    public void assign() { state.assign(this); }
    public void acknowledge() { state.acknowledge(this); }
    public void startInvestigation() { state.startInvestigation(this); }
    public void resolve(String notes) { state.resolve(this, notes); }
    public void verify() { state.verify(this); }
    public void close() { state.close(this); }

    // Comment handling (Enforces BR-1.3 Closed Immutability)
    public void addComment(IncidentComment comment) {
        if ("CLOSED".equals(this.state.getStateName())) {
            throw new IllegalStateException("Cannot add comments to a CLOSED incident.");
        }
        this.comments.add(comment);
        this.updatedAt = LocalDateTime.now();
    }

    public List<IncidentComment> getComments() {
        return Collections.unmodifiableList(comments);
    }

    // Getters & Setters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getStatus() { return state.getStateName(); }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }
}