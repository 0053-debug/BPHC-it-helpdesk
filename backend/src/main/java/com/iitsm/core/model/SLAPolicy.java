package com.iitsm.core.model;

import com.iitsm.core.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sla_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLAPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private Priority priority;

    @Column(name = "response_target_minutes", nullable = false)
    private Integer responseTargetMinutes;

    @Column(name = "resolution_target_minutes", nullable = false)
    private Integer resolutionTargetMinutes;
}
