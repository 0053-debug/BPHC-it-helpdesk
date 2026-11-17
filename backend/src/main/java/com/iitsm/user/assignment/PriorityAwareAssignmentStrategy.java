package com.iitsm.user.assignment;

import com.iitsm.core.enums.AvailabilityStatus;
import com.iitsm.core.enums.IncidentCategory;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.model.Technician;
import com.iitsm.core.exception.IitsmException;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component("priorityAwareAssignmentStrategy")
public class PriorityAwareAssignmentStrategy implements AssignmentStrategy {

    private static final int DEFAULT_CAPACITY = 5;

    @Override
    public Optional<Technician> assign(
            IncidentCategory category, List<Technician> technicians, Map<Long, Integer> activeWorkloads) {
        throw new IitsmException("Priority and historical expertise are required for priority-aware assignment");
    }

    @Override
    public Optional<Technician> assign(
            IncidentCategory category,
            Priority priority,
            List<Technician> technicians,
            Map<Long, Integer> activeWorkloads,
            Map<Long, TechnicianExpertise> expertiseByTechnician) {
        AssignmentWeights weights = AssignmentWeights.forPriority(priority);
        return technicians.stream()
                .filter(technician -> Boolean.TRUE.equals(technician.getActive()))
                .filter(technician -> technician.getStatus() == AvailabilityStatus.AVAILABLE)
                .filter(technician -> hasSkill(technician, category))
                .filter(technician -> hasCapacity(technician, activeWorkloads))
                .sorted(Comparator.comparingDouble((Technician technician) ->
                                -score(technician, weights, activeWorkloads, expertiseByTechnician))
                        .thenComparing(Technician::getId, Comparator.nullsLast(Long::compareTo)))
                .findFirst();
    }

    public double score(
            Technician technician,
            Priority priority,
            Map<Long, Integer> activeWorkloads,
            Map<Long, TechnicianExpertise> expertiseByTechnician) {
        return score(technician, AssignmentWeights.forPriority(priority), activeWorkloads, expertiseByTechnician);
    }

    private double score(
            Technician technician,
            AssignmentWeights weights,
            Map<Long, Integer> activeWorkloads,
            Map<Long, TechnicianExpertise> expertiseByTechnician) {
        int maxWorkload = capacityOf(technician);
        int activeWorkload = activeWorkloads.getOrDefault(technician.getId(), 0);
        double freeCapacity = 100.0 * (1.0 - (double) activeWorkload / maxWorkload);
        double expertise = expertiseByTechnician
                .getOrDefault(technician.getId(), TechnicianExpertise.coldStart())
                .score();
        return weights.expertiseWeight() * expertise
                + weights.capacityWeight() * freeCapacity;
    }

    private boolean hasSkill(Technician technician, IncidentCategory category) {
        if (technician.getSkills() == null) {
            return false;
        }
        return java.util.Arrays.stream(technician.getSkills().split(","))
                .map(String::trim)
                .anyMatch(skill -> skill.equalsIgnoreCase(category.name()));
    }

    private boolean hasCapacity(Technician technician, Map<Long, Integer> activeWorkloads) {
        int capacity = capacityOf(technician);
        return capacity > 0 && activeWorkloads.getOrDefault(technician.getId(), 0) < capacity;
    }

    private int capacityOf(Technician technician) {
        return technician.getMaxWorkload() == null ? DEFAULT_CAPACITY : technician.getMaxWorkload();
    }

    private record AssignmentWeights(double expertiseWeight, double capacityWeight) {
        private static AssignmentWeights forPriority(Priority priority) {
            return switch (priority) {
                case P1_CRITICAL -> new AssignmentWeights(0.80, 0.20);
                case P2_HIGH -> new AssignmentWeights(0.65, 0.35);
                case P3_MEDIUM -> new AssignmentWeights(0.40, 0.60);
                case P4_LOW -> new AssignmentWeights(0.20, 0.80);
            };
        }
    }
}
