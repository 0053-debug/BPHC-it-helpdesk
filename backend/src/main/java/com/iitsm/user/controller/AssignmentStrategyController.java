package com.iitsm.user.controller;

import com.iitsm.user.dto.AssignmentStrategyRequest;
import com.iitsm.user.dto.AssignmentStrategyResponse;
import com.iitsm.user.service.TechnicianAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/assignment-strategy")
public class AssignmentStrategyController {

    private final TechnicianAssignmentService assignmentService;

    public AssignmentStrategyController(TechnicianAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public ResponseEntity<AssignmentStrategyResponse> getStrategy() {
        return ResponseEntity.ok(assignmentService.getActiveStrategy());
    }

    @PostMapping
    public ResponseEntity<AssignmentStrategyResponse> setStrategy(
            @Valid @RequestBody AssignmentStrategyRequest request) {
        return ResponseEntity.ok(assignmentService.setActiveStrategy(request.strategy()));
    }
}
