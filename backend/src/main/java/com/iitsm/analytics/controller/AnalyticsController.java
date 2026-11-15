package com.iitsm.analytics.controller;

import com.iitsm.analytics.dto.BottleneckInsightDTO;
import com.iitsm.analytics.dto.DashboardOverviewDTO;
import com.iitsm.analytics.dto.ServiceHealthDTO;
import com.iitsm.analytics.dto.TechnicianWorkloadDTO;
import com.iitsm.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<DashboardOverviewDTO> getOverview() {
        return ResponseEntity.ok(analyticsService.getDashboardOverview());
    }

    @GetMapping("/technician-workload")
    public ResponseEntity<List<TechnicianWorkloadDTO>> getTechnicianWorkload() {
        return ResponseEntity.ok(analyticsService.getTechnicianWorkload());
    }

    @GetMapping("/service-health")
    public ResponseEntity<List<ServiceHealthDTO>> getServiceHealth() {
        return ResponseEntity.ok(analyticsService.getServiceHealth());
    }

    @GetMapping("/bottlenecks")
    public ResponseEntity<List<BottleneckInsightDTO>> getBottlenecks() {
        return ResponseEntity.ok(analyticsService.getBottlenecks());
    }
}
