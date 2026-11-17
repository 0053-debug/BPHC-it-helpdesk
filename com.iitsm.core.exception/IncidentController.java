package com.iitsm.core.controller;

import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentComment;
import com.iitsm.core.service.IncidentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.createIncident(incident));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncident(id));
    }

    @PatchMapping("/{id}/classify")
    public ResponseEntity<Incident> classifyIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.classifyIncident(id));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Incident> assignIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.assignIncident(id));
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<Incident> acknowledgeIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.acknowledgeIncident(id));
    }

    @PatchMapping("/{id}/investigate")
    public ResponseEntity<Incident> investigateIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.investigateIncident(id));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Incident> resolveIncident(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String notes = payload != null ? payload.get("resolutionNotes") : null;
        return ResponseEntity.ok(incidentService.resolveIncident(id, notes));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<Incident> verifyIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.verifyIncident(id));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<Incident> closeIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.closeIncident(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<IncidentComment> addComment(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String content = payload != null ? payload.get("content") : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(incidentService.addComment(id, "CURRENT_USER", content));
    }
}