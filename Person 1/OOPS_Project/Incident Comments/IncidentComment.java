package OOPS_Project;

import java.time.LocalDateTime;
import java.util.UUID;

public class IncidentComment {
    private String id;
    private String incidentId;
    private String authorId;
    private String content;
    private LocalDateTime timestamp;

    public IncidentComment(String incidentId, String authorId, String content) {
        this.id = "CMT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.incidentId = incidentId;
        this.authorId = authorId;
        this.content = content;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getIncidentId() { return incidentId; }
    public String getAuthorId() { return authorId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
