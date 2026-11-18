package com.iitsm.duplicate;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import com.iitsm.incident.service.IncidentService;

import java.util.List;

@RestController
@RequestMapping("/api/duplicates")
public class DuplicateController {

    private final IncidentService service;

    public DuplicateController(IncidentService service) {
        this.service = service;
    }

    @PostMapping("/check")
    public List<DuplicateMatch> check(@Valid @RequestBody DuplicateCheckRequest request) {
        return service.checkDuplicates(request.serviceId(), request.title(), request.description());
    }
}
