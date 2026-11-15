package com.iitsm.user;

import com.iitsm.core.enums.AvailabilityStatus;
import com.iitsm.core.enums.IncidentCategory;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.exception.IitsmException;
import com.iitsm.core.model.Technician;
import com.iitsm.user.assignment.LoadBasedAssignmentStrategy;
import com.iitsm.user.assignment.NoEligibleTechnicianException;
import com.iitsm.user.assignment.PriorityAwareAssignmentStrategy;
import com.iitsm.user.assignment.SkillBasedAssignmentStrategy;
import com.iitsm.user.assignment.AssignmentStrategyType;
import com.iitsm.user.assignment.TechnicianExpertise;
import com.iitsm.user.repository.TechnicianRepository;
import com.iitsm.user.service.IncidentWorkloadProvider;
import com.iitsm.user.service.TechnicianAssignmentService;
import com.iitsm.user.service.TechnicianPerformanceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TechnicianAssignmentStrategyTest {

    private final SkillBasedAssignmentStrategy skillStrategy = new SkillBasedAssignmentStrategy();
    private final LoadBasedAssignmentStrategy loadStrategy = new LoadBasedAssignmentStrategy();
    private final PriorityAwareAssignmentStrategy priorityStrategy = new PriorityAwareAssignmentStrategy();

    @Mock
    private TechnicianRepository technicianRepository;

    @Mock
    private IncidentWorkloadProvider workloadProvider;

    @Mock
    private TechnicianPerformanceService performanceService;

    @Test
    void skillStrategySelectsLowestWorkloadMatchingTechnicianOnly() {
        Technician match = technician(1L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        Technician wrongSkill = technician(2L, "DATABASE", AvailabilityStatus.AVAILABLE, 5);
        Technician higherLoadMatch = technician(3L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);

        var selected = skillStrategy.assign(
                IncidentCategory.NETWORK, List.of(match, wrongSkill, higherLoadMatch), Map.of(1L, 1, 3L, 3));

        assertEquals(1L, selected.orElseThrow().getId());
    }

    @Test
    void fullOrUnavailableTechniciansAreExcludedAtCapacityLimit() {
        Technician full = technician(1L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        Technician unavailable = technician(2L, "NETWORK", AvailabilityStatus.ON_LEAVE, 5);

        var selected = skillStrategy.assign(
                IncidentCategory.NETWORK, List.of(full, unavailable), Map.of(1L, 5));

        org.junit.jupiter.api.Assertions.assertTrue(selected.isEmpty());
    }

    @Test
    void strategyTiesAreResolvedByTechnicianId() {
        Technician higherId = technician(9L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        Technician lowerId = technician(3L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);

        assertEquals(3L, skillStrategy.assign(
                IncidentCategory.NETWORK, List.of(higherId, lowerId), Map.of()).orElseThrow().getId());
        assertEquals(3L, loadStrategy.assign(
                IncidentCategory.NETWORK, List.of(higherId, lowerId), Map.of()).orElseThrow().getId());
    }

    @Test
    void allThreeStrategiesCanBeSwitchedWithoutChangingExistingAlgorithms() {
        Technician workloadHeavyExpert = technician(1L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        Technician lowerWorkload = technician(2L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        List<Technician> technicians = List.of(workloadHeavyExpert, lowerWorkload);
        when(technicianRepository.findAllByActiveTrueOrderByIdAsc()).thenReturn(technicians);
        when(workloadProvider.getActiveWorkloads(List.of(1L, 2L))).thenReturn(Map.of(1L, 4, 2L, 0));
        when(performanceService.getExpertiseScores(IncidentCategory.NETWORK, List.of(1L, 2L)))
                .thenReturn(Map.of(
                        1L, new TechnicianExpertise(100, 100, 100.0),
                        2L, TechnicianExpertise.coldStart()));

        TechnicianAssignmentService service = new TechnicianAssignmentService(
                technicianRepository, workloadProvider, performanceService,
                skillStrategy, loadStrategy, priorityStrategy);
        assertEquals(2L, service.selectTechnician(IncidentCategory.NETWORK).getId());

        service.setActiveStrategy(AssignmentStrategyType.LOAD_BASED);
        assertEquals(2L, service.selectTechnician(IncidentCategory.NETWORK).getId());

        service.setActiveStrategy(AssignmentStrategyType.PRIORITY_AWARE);
        assertThrows(IitsmException.class, () -> service.selectTechnician(IncidentCategory.NETWORK));
        assertEquals(1L, service.selectTechnician(IncidentCategory.NETWORK, Priority.P1_CRITICAL).getId());
    }

    @Test
    void skillStrategyReportsNoEligibleTechnicianRatherThanExceedingCapacity() {
        Technician full = technician(1L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        when(technicianRepository.findAllByActiveTrueOrderByIdAsc()).thenReturn(List.of(full));
        when(workloadProvider.getActiveWorkloads(List.of(1L))).thenReturn(Map.of(1L, 5));
        TechnicianAssignmentService service = new TechnicianAssignmentService(
                technicianRepository, workloadProvider, performanceService,
                skillStrategy, loadStrategy, priorityStrategy);

        assertThrows(NoEligibleTechnicianException.class,
                () -> service.selectTechnician(IncidentCategory.NETWORK));
    }

    @Test
    void priorityAndCapacityWeightsCanSelectDifferentTechnicians() {
        Technician experienced = technician(1L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        Technician free = technician(2L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        Map<Long, Integer> workloads = Map.of(1L, 4, 2L, 0);
        Map<Long, TechnicianExpertise> expertise = Map.of(
                1L, new TechnicianExpertise(100, 100, 100.0),
                2L, TechnicianExpertise.coldStart());

        assertEquals(84.0, priorityStrategy.score(
                experienced, Priority.P1_CRITICAL, workloads, expertise), 0.01);
        assertEquals(36.0, priorityStrategy.score(
                experienced, Priority.P4_LOW, workloads, expertise), 0.01);
        assertEquals(48.0, priorityStrategy.score(
                free, Priority.P1_CRITICAL, workloads, expertise), 0.01);
        assertEquals(87.0, priorityStrategy.score(
                free, Priority.P4_LOW, workloads, expertise), 0.01);
        assertEquals(1L, priorityStrategy.assign(
                IncidentCategory.NETWORK, Priority.P1_CRITICAL, List.of(experienced, free), workloads, expertise)
                .orElseThrow().getId());
        assertEquals(2L, priorityStrategy.assign(
                IncidentCategory.NETWORK, Priority.P4_LOW, List.of(experienced, free), workloads, expertise)
                .orElseThrow().getId());
    }

    @Test
    void priorityStrategyExcludesInactiveUnavailableUnqualifiedAndFullTechnicians() {
        Technician inactive = technician(1L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        inactive.setActive(false);
        Technician unavailable = technician(2L, "NETWORK", AvailabilityStatus.ON_LEAVE, 5);
        Technician unqualified = technician(3L, "DATABASE", AvailabilityStatus.AVAILABLE, 5);
        Technician full = technician(4L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        Technician eligible = technician(5L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        List<Technician> candidates = List.of(inactive, unavailable, unqualified, full, eligible);

        assertEquals(5L, priorityStrategy.assign(
                IncidentCategory.NETWORK,
                Priority.P2_HIGH,
                candidates,
                Map.of(4L, 5, 5L, 2),
                Map.of())
                .orElseThrow().getId());
    }

    @Test
    void priorityStrategyHandlesMissingHistoryAndBreaksTiesByTechnicianId() {
        Technician higherId = technician(9L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);
        Technician lowerId = technician(3L, "NETWORK", AvailabilityStatus.AVAILABLE, 5);

        assertEquals(3L, priorityStrategy.assign(
                IncidentCategory.NETWORK,
                Priority.P3_MEDIUM,
                List.of(higherId, lowerId),
                Map.of(),
                Map.of())
                .orElseThrow().getId());
        assertEquals(35.0, TechnicianExpertise.coldStart().score());
    }

    private Technician technician(Long id, String skills, AvailabilityStatus status, int capacity) {
        return Technician.builder()
                .id(id)
                .fullName("Tech " + id)
                .email("tech" + id + "@example.edu")
                .passwordHash("not-used-by-strategy")
                .skills(skills)
                .status(status)
                .maxWorkload(capacity)
                .build();
    }
}
