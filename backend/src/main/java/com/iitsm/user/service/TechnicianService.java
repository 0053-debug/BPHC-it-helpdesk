package com.iitsm.user.service;

import com.iitsm.core.enums.AvailabilityStatus;
import com.iitsm.core.enums.UserRole;
import com.iitsm.core.exception.ResourceNotFoundException;
import com.iitsm.core.exception.UnauthorizedOperationException;
import com.iitsm.core.model.Technician;
import com.iitsm.user.dto.TechnicianResponse;
import com.iitsm.user.repository.TechnicianRepository;
import com.iitsm.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class TechnicianService {

    private static final int DEFAULT_CAPACITY = 5;

    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final IncidentWorkloadProvider workloadProvider;

    public TechnicianService(
            TechnicianRepository technicianRepository,
            UserRepository userRepository,
            IncidentWorkloadProvider workloadProvider) {
        this.technicianRepository = technicianRepository;
        this.userRepository = userRepository;
        this.workloadProvider = workloadProvider;
    }

    @Transactional(readOnly = true)
    public List<TechnicianResponse> listTechnicians() {
        List<Technician> technicians = technicianRepository.findAllByActiveTrueOrderByIdAsc();
        Collection<Long> ids = technicians.stream().map(Technician::getId).toList();
        Map<Long, Integer> activeWorkloads = workloadProvider.getActiveWorkloads(ids);
        return technicians.stream()
                .map(technician -> toResponse(
                        technician, activeWorkloads.getOrDefault(technician.getId(), 0)))
                .toList();
    }

    @Transactional(readOnly = true)
    public TechnicianResponse getTechnician(Long id) {
        Technician technician = technicianRepository.findById(id)
                .filter(user -> Boolean.TRUE.equals(user.getActive()))
                .orElseThrow(() -> new ResourceNotFoundException("Technician", id));
        int activeWorkload = workloadProvider
                .getActiveWorkloads(List.of(id))
                .getOrDefault(id, 0);
        return toResponse(technician, activeWorkload);
    }

    @Transactional
    public TechnicianResponse updateAvailability(
            Long technicianId, AvailabilityStatus availability, String authenticatedEmail) {
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician", technicianId));
        var actor = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new UnauthorizedOperationException("Authenticated user was not found"));
        boolean isAdmin = actor.getRole() == UserRole.ROLE_ADMIN;
        boolean isSelf = actor.getId().equals(technician.getId());
        if (!isAdmin && !isSelf) {
            throw new UnauthorizedOperationException("You may only update your own availability");
        }
        if (!isAdmin && actor.getRole() != UserRole.ROLE_TECHNICIAN) {
            throw new UnauthorizedOperationException("Only technicians and administrators may update availability");
        }

        technician.setStatus(availability);
        return toResponse(technicianRepository.save(technician), getWorkload(technicianId));
    }

    private int getWorkload(Long technicianId) {
        return workloadProvider.getActiveWorkloads(List.of(technicianId)).getOrDefault(technicianId, 0);
    }

    private TechnicianResponse toResponse(Technician technician, int activeWorkload) {
        return new TechnicianResponse(
                technician.getId(),
                technician.getFullName(),
                technician.getEmail(),
                parseSkills(technician.getSkills()),
                technician.getStatus(),
                activeWorkload,
                capacityOf(technician));
    }

    private List<String> parseSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return List.of();
        }
        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(skill -> !skill.isEmpty())
                .map(skill -> skill.toUpperCase(Locale.ROOT))
                .distinct()
                .toList();
    }

    private int capacityOf(Technician technician) {
        return technician.getMaxWorkload() == null ? DEFAULT_CAPACITY : technician.getMaxWorkload();
    }
}
