package com.iitsm.sla;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "escalation_records", uniqueConstraints = @UniqueConstraint(columnNames = {"incident_id", "level"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscalationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false)
    private Long incidentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EscalationLevel level;

    @Column(name = "escalated_at", nullable = false)
    private LocalDateTime escalatedAt;

    private String reason;
}
