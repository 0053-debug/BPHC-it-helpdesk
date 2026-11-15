package com.iitsm.user.service;

import com.iitsm.core.enums.IncidentCategory;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.exception.IitsmException;
import com.iitsm.core.model.Technician;
import com.iitsm.user.assignment.AssignmentStrategy;
import com.iitsm.user.assignment.AssignmentStrategyType;
import com.iitsm.user.assignment.LoadBasedAssignmentStrategy;
import com.iitsm.user.assignment.NoEligibleTechnicianException;
import com.iitsm.user.assignment.PriorityAwareAssignmentStrategy;
import com.iitsm.user.assignment.SkillBasedAssignmentStrategy;
import com.iitsm.user.assignment.TechnicianExpertise;
import com.iitsm.user.dto.AssignmentStrategyResponse;
import com.iitsm.user.repository.TechnicianRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class TechnicianAssignmentService {

    private final TechnicianRepository technicianRepository;
    private final IncidentWorkloadProvider workloadProvider;
    private final TechnicianPerformanceService performanceService;
    private final Map<AssignmentStrategyType, AssignmentStrategy> strategies;
    private final AtomicReference<AssignmentStrategyType> activeStrategy =
            new AtomicReference<>(AssignmentStrategyType.SKILL_BASED);

    public TechnicianAssignmentService(
            TechnicianRepository technicianRepository,
            IncidentWorkloadProvider workloadProvider,
            TechnicianPerformanceService performanceService,
            SkillBasedAssignmentStrategy skillBased,
            LoadBasedAssignmentStrategy loadBased,
            PriorityAwareAssignmentStrategy priorityAware) {
        this.technicianRepository = technicianRepository;
        this.workloadProvider = workloadProvider;
        this.performanceService = performanceService;
        this.strategies = Map.of(
                AssignmentStrategyType.SKILL_BASED, skillBased,
                AssignmentStrategyType.LOAD_BASED, loadBased,
                AssignmentStrategyType.PRIORITY_AWARE, priorityAware);
    }

    @Transactional(readOnly = true)
    public Technician selectTechnician(IncidentCategory category) {
        return selectTechnician(category, Priority.P4_LOW, false);
    }

    @Transactional(readOnly = true)
    public Technician selectTechnician(IncidentCategory category, Priority priority) {
        return selectTechnician(category, priority, true);
    }

    private Technician selectTechnician(
            IncidentCategory category, Priority priority, boolean priorityWasProvided) {
        AssignmentStrategyType selectedStrategy = activeStrategy.get();
        if (selectedStrategy == AssignmentStrategyType.PRIORITY_AWARE && !priorityWasProvided) {
            throw new IitsmException("Incident priority is required for priority-aware assignment");
        }
        if (priority == null) {
            throw new IitsmException("Incident priority is required for assignment");
        }
        List<Technician> technicians = technicianRepository.findAllByActiveTrueOrderByIdAsc();
        List<Long> technicianIds = technicians.stream().map(Technician::getId).toList();
        Map<Long, Integer> activeWorkloads = workloadProvider.getActiveWorkloads(technicianIds);
        Map<Long, TechnicianExpertise> expertise = selectedStrategy == AssignmentStrategyType.PRIORITY_AWARE
                ? performanceService.getExpertiseScores(category, technicianIds)
                : Map.of();
        return strategies.get(selectedStrategy)
                .assign(category, priority, technicians, activeWorkloads, expertise)
                .orElseThrow(NoEligibleTechnicianException::new);
    }

    public AssignmentStrategyResponse getActiveStrategy() {
        return new AssignmentStrategyResponse(activeStrategy.get());
    }

    public AssignmentStrategyResponse setActiveStrategy(AssignmentStrategyType strategy) {
        activeStrategy.set(strategy);
        return getActiveStrategy();
    }
}
