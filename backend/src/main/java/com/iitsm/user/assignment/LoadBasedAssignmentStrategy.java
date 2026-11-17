package com.iitsm.user.assignment;

import com.iitsm.core.enums.AvailabilityStatus;
import com.iitsm.core.enums.IncidentCategory;
import com.iitsm.core.model.Technician;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component("loadBasedAssignmentStrategy")
public class LoadBasedAssignmentStrategy implements AssignmentStrategy {

    @Override
    public Optional<Technician> assign(
            IncidentCategory category, List<Technician> technicians, Map<Long, Integer> activeWorkloads) {
        return technicians.stream()
                .filter(technician -> technician.getStatus() == AvailabilityStatus.AVAILABLE)
                .filter(technician -> SkillBasedAssignmentStrategy.hasCapacity(technician, activeWorkloads))
                .min(Comparator.comparingDouble((Technician technician) ->
                                (double) SkillBasedAssignmentStrategy.workloadOf(technician, activeWorkloads)
                                        / SkillBasedAssignmentStrategy.capacityOf(technician))
                        .thenComparing(Technician::getId, Comparator.nullsLast(Long::compareTo)));
    }
}
