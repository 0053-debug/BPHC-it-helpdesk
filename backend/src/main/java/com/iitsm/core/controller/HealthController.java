package com.iitsm.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping(value = {"/", "/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "app", "iitsm-backend",
                "version", "1.1.0",
                "timestamp", Instant.now().toString()
        ));
    }
}
