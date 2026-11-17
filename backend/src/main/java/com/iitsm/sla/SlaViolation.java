package com.iitsm.sla;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sla_violations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"incident_id", "violation_type"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlaViolation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false)
    private Long incidentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "violation_type", nullable = false)
    private ViolationType violationType;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;
}
