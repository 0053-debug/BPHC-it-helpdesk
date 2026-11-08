package com.iitsm.servicecatalog.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "criticality_factor", nullable = false, precision = 3, scale = 2)
    private BigDecimal criticalityFactor = BigDecimal.valueOf(1.00); // 1.00 to 2.00

    @Builder.Default
    @Column(name = "base_sla_weight", nullable = false)
    private Integer baseSlaWeight = 0; // 0 to 4

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private ServiceStatus status = ServiceStatus.OPERATIONAL;

    @Builder.Default
    @Column(name = "baseline_mttr_minutes", nullable = false)
    private Integer baselineMttrMinutes = 120; // Used for bottleneck deviation calculation

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "service_dependencies",
            joinColumns = @JoinColumn(name = "service_id"),
            inverseJoinColumns = @JoinColumn(name = "depends_on_service_id")
    )
    private Set<ServiceEntity> dependencies = new HashSet<>();

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
