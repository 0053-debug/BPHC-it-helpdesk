package com.iitsm.user.assignment;

import com.iitsm.core.enums.AvailabilityStatus;
import com.iitsm.core.enums.IncidentCategory;
import com.iitsm.core.model.Technician;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component("skillBasedAssignmentStrategy")
public class SkillBasedAssignmentStrategy implements AssignmentStrategy {

    private static final int DEFAULT_CAPACITY = 5;

    @Override
    public Optional<Technician> assign(
            IncidentCategory category, List<Technician> technicians, Map<Long, Integer> activeWorkloads) {
        return technicians.stream()
                .filter(technician -> technician.getStatus() == AvailabilityStatus.AVAILABLE)
                .filter(technician -> hasCapacity(technician, activeWorkloads))
                .filter(technician -> hasSkill(technician, category))
                .min(Comparator.comparingInt((Technician technician) -> workloadOf(technician, activeWorkloads))
                        .thenComparing(Technician::getId, Comparator.nullsLast(Long::compareTo)));
    }

    private boolean hasSkill(Technician technician, IncidentCategory category) {
        if (technician.getSkills() == null) {
            return false;
        }
        return java.util.Arrays.stream(technician.getSkills().split(","))
                .map(String::trim)
                .anyMatch(skill -> skill.equalsIgnoreCase(category.name()));
    }

    static boolean hasCapacity(Technician technician, Map<Long, Integer> activeWorkloads) {
        Integer capacity = technician.getMaxWorkload() == null
                ? DEFAULT_CAPACITY
                : technician.getMaxWorkload();
        return capacity != null && capacity > 0
                && workloadOf(technician, activeWorkloads) < capacity;
    }

    static int capacityOf(Technician technician) {
        return technician.getMaxWorkload() == null ? DEFAULT_CAPACITY : technician.getMaxWorkload();
    }

    static int workloadOf(Technician technician, Map<Long, Integer> activeWorkloads) {
        return activeWorkloads.getOrDefault(technician.getId(), 0);
    }
}
