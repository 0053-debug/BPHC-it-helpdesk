package com.iitsm.servicecatalog.controller;

import com.iitsm.servicecatalog.dto.ServiceCreateRequest;
import com.iitsm.servicecatalog.dto.ServiceDependencyGraphDTO;
import com.iitsm.servicecatalog.dto.ServiceResponseDTO;
import com.iitsm.servicecatalog.service.ServiceCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ServiceCatalogController {

    private final ServiceCatalogService serviceCatalogService;

    @GetMapping
    public ResponseEntity<List<ServiceResponseDTO>> getAllServices() {
        return ResponseEntity.ok(serviceCatalogService.getAllServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceCatalogService.getServiceById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceResponseDTO> createService(@Valid @RequestBody ServiceCreateRequest request) {
        return new ResponseEntity<>(serviceCatalogService.createService(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> updateService(@PathVariable Long id, @Valid @RequestBody ServiceCreateRequest request) {
        return ResponseEntity.ok(serviceCatalogService.updateService(id, request));
    }

    @GetMapping("/dependency-graph")
    public ResponseEntity<ServiceDependencyGraphDTO> getDependencyGraph() {
        return ResponseEntity.ok(serviceCatalogService.getDependencyGraph());
    }
}
