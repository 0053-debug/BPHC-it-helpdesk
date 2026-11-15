package com.iitsm.user.controller;

import com.iitsm.user.dto.AvailabilityUpdateRequest;
import com.iitsm.user.dto.TechnicianResponse;
import com.iitsm.user.service.TechnicianService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @GetMapping
    public ResponseEntity<List<TechnicianResponse>> listTechnicians() {
        return ResponseEntity.ok(technicianService.listTechnicians());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TechnicianResponse> getTechnician(@PathVariable Long id) {
        return ResponseEntity.ok(technicianService.getTechnician(id));
    }

    @PutMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TechnicianResponse> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody AvailabilityUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(technicianService.updateAvailability(
                id, request.availability(), authentication.getName()));
    }
}
