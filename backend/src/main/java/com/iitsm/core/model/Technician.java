package com.iitsm.core.model;

import com.iitsm.core.enums.AvailabilityStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("TECHNICIAN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Technician extends User {

    @Column(name = "skills")
    private String skills; // Comma-separated list of categories e.g. "NETWORK,HARDWARE"

    @Builder.Default
    @Column(name = "max_workload")
    private Integer maxWorkload = 5;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status")
    private AvailabilityStatus status = AvailabilityStatus.AVAILABLE;
}
