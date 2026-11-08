package com.iitsm.analytics.dto;

import com.iitsm.core.enums.AvailabilityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianWorkloadDTO {
    private Long technicianId;
    private String name;
    private String email;
    private String skills;
    private int activeTickets;
    private int maxWorkload;
    private double capacityUtilizationPercentage; // (activeTickets / maxWorkload) * 100
    private AvailabilityStatus status;
}
