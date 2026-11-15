package com.iitsm.user.assignment;

import com.iitsm.core.enums.IncidentCategory;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.model.Technician;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface AssignmentStrategy {
    Optional<Technician> assign(
            IncidentCategory category, List<Technician> technicians, Map<Long, Integer> activeWorkloads);

    default Optional<Technician> assign(
            IncidentCategory category,
            Priority priority,
            List<Technician> technicians,
            Map<Long, Integer> activeWorkloads,
            Map<Long, TechnicianExpertise> expertiseByTechnician) {
        return assign(category, technicians, activeWorkloads);
    }
}
