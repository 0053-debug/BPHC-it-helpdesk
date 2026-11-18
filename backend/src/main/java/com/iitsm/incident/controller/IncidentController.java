package com.iitsm.incident.controller;

import com.iitsm.incident.dto.IncidentCommentRequest;
import com.iitsm.incident.dto.IncidentCommentResponse;
import com.iitsm.incident.dto.IncidentCreateRequest;
import com.iitsm.incident.dto.IncidentResolutionRequest;
import com.iitsm.incident.dto.IncidentResponse;
import com.iitsm.incident.dto.ResolutionSuggestionRequest;
import com.iitsm.incident.dto.ResolutionSuggestionResponse;
import com.iitsm.incident.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {
    private final IncidentService incidents;
    public IncidentController(IncidentService incidents) { this.incidents = incidents; }

    @GetMapping
    public List<IncidentResponse> search(Authentication authentication,
            @RequestParam(required=false) String id,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required=false) String status, @RequestParam(required=false) String priority,
            @RequestParam(required=false) Long serviceId, @RequestParam(required=false) Long technicianId,
            @RequestParam(required=false) String slaStatus) {
        return incidents.search(authentication.getName(), id, dateFrom, dateTo, status, priority, serviceId, technicianId, slaStatus);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidentResponse create(@Valid @RequestBody IncidentCreateRequest request, Authentication authentication) {
        return incidents.create(request, authentication.getName());
    }
    @PostMapping("/recommendations")
    public List<ResolutionSuggestionResponse> recommend(@Valid @RequestBody ResolutionSuggestionRequest request, Authentication auth) {
        return incidents.recommendResolutions(request, auth.getName());
    }
    @GetMapping("/{id}") public IncidentResponse get(@PathVariable Long id, Authentication auth) { return incidents.get(id, auth.getName()); }
    @GetMapping("/{id}/comments") public List<IncidentCommentResponse> comments(@PathVariable Long id, Authentication auth) { return incidents.comments(id, auth.getName()); }
    @PostMapping("/{id}/comments") @ResponseStatus(HttpStatus.CREATED)
    public IncidentCommentResponse comment(@PathVariable Long id, @Valid @RequestBody IncidentCommentRequest request, Authentication auth) { return incidents.addComment(id, request.message(), auth.getName()); }
    @PostMapping("/{id}/verify") public IncidentResponse verify(@PathVariable Long id, Authentication auth) { return incidents.verify(id, auth.getName()); }
    @PostMapping("/{id}/close") public IncidentResponse close(@PathVariable Long id, Authentication auth) { return incidents.close(id, auth.getName()); }
    @PostMapping("/{id}/acknowledge") public IncidentResponse acknowledge(@PathVariable Long id, Authentication auth) { return incidents.acknowledge(id, auth.getName()); }
    @PostMapping("/{id}/investigate") public IncidentResponse investigate(@PathVariable Long id, Authentication auth) { return incidents.investigate(id, auth.getName()); }
    @PostMapping("/{id}/resolve") public IncidentResponse resolve(@PathVariable Long id, @Valid @RequestBody IncidentResolutionRequest request, Authentication auth) { return incidents.resolve(id, request.resolutionNotes(), request.rootCause(), auth.getName()); }
    @PostMapping("/{id}/assign") public IncidentResponse assign(@PathVariable Long id, Authentication auth) { return incidents.assign(id, auth.getName()); }
}
