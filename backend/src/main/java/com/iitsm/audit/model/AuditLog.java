package com.iitsm.audit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(updatable = false)
    private Long id;

    @Column(name = "incident_id", updatable = false)
    private Long incidentId;

    @Column(name = "actor_id", updatable = false)
    private Long actorId;

    @Column(name = "actor_name", updatable = false)
    private String actorName;

    @Column(name = "actor_role", updatable = false)
    private String actorRole;

    @Column(name = "action", nullable = false, updatable = false)
    private String action;

    @Column(name = "previous_state", updatable = false)
    private String previousState;

    @Column(name = "new_state", updatable = false)
    private String newState;

    @Column(name = "description", columnDefinition = "TEXT", updatable = false)
    private String description;

    @Builder.Default
    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp = Instant.now();
}
