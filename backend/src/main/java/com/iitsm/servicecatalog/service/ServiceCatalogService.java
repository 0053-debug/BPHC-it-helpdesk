package com.iitsm.servicecatalog.service;

import com.iitsm.core.exception.IitsmException;
import com.iitsm.core.exception.ResourceNotFoundException;
import com.iitsm.servicecatalog.dto.ServiceCreateRequest;
import com.iitsm.servicecatalog.dto.ServiceDependencyGraphDTO;
import com.iitsm.servicecatalog.dto.ServiceResponseDTO;
import com.iitsm.servicecatalog.model.ServiceEntity;
import com.iitsm.servicecatalog.repository.ServiceCatalogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceCatalogService {

    private final ServiceCatalogRepository serviceCatalogRepository;

    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> getAllServices() {
        return serviceCatalogRepository.findAllWithDependencies().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceResponseDTO getServiceById(Long id) {
        ServiceEntity entity = serviceCatalogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", id));
        return toDTO(entity);
    }

    @Transactional
    public ServiceResponseDTO createService(ServiceCreateRequest request) {
        log.info("Creating new IT service: {}", request.getName());

        ServiceEntity service = ServiceEntity.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .criticalityFactor(request.getCriticalityFactor())
                .baseSlaWeight(request.getBaseSlaWeight())
                .status(request.getStatus())
                .baselineMttrMinutes(request.getBaselineMttrMinutes() != null ? request.getBaselineMttrMinutes() : 120)
                .dependencies(new HashSet<>())
                .build();

        if (request.getDependencyIds() != null && !request.getDependencyIds().isEmpty()) {
            Set<ServiceEntity> upstreamServices = new HashSet<>(serviceCatalogRepository.findAllById(request.getDependencyIds()));
            service.setDependencies(upstreamServices);
        }

        ServiceEntity saved = serviceCatalogRepository.save(service);
        return toDTO(saved);
    }

    @Transactional
    public ServiceResponseDTO updateService(Long id, ServiceCreateRequest request) {
        log.info("Updating service ID: {}", id);
        ServiceEntity service = serviceCatalogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", id));

        service.setName(request.getName());
        service.setCode(request.getCode().toUpperCase());
        service.setDescription(request.getDescription());
        service.setCriticalityFactor(request.getCriticalityFactor());
        service.setBaseSlaWeight(request.getBaseSlaWeight());
        service.setStatus(request.getStatus());
        if (request.getBaselineMttrMinutes() != null) {
            service.setBaselineMttrMinutes(request.getBaselineMttrMinutes());
        }
        service.setUpdatedAt(Instant.now());

        if (request.getDependencyIds() != null) {
            // Check for self dependency
            if (request.getDependencyIds().contains(id)) {
                throw new IitsmException("A service cannot depend on itself.");
            }

            // Check for circular dependency
            validateNoCircularDependency(id, request.getDependencyIds());

            Set<ServiceEntity> upstreamServices = new HashSet<>(serviceCatalogRepository.findAllById(request.getDependencyIds()));
            service.setDependencies(upstreamServices);
        }

        return toDTO(serviceCatalogRepository.save(service));
    }

    @Transactional(readOnly = true)
    public ServiceDependencyGraphDTO getDependencyGraph() {
        List<ServiceEntity> allServices = serviceCatalogRepository.findAllWithDependencies();

        List<ServiceDependencyGraphDTO.Node> nodes = allServices.stream()
                .map(s -> ServiceDependencyGraphDTO.Node.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .code(s.getCode())
                        .status(s.getStatus())
                        .criticality(s.getCriticalityFactor())
                        .build())
                .collect(Collectors.toList());

        List<ServiceDependencyGraphDTO.Edge> edges = new ArrayList<>();
        for (ServiceEntity service : allServices) {
            if (service.getDependencies() != null) {
                for (ServiceEntity dep : service.getDependencies()) {
                    edges.add(ServiceDependencyGraphDTO.Edge.builder()
                            .source(service.getId())
                            .target(dep.getId())
                            .build());
                }
            }
        }

        return ServiceDependencyGraphDTO.builder()
                .nodes(nodes)
                .edges(edges)
                .build();
    }

    private void validateNoCircularDependency(Long targetServiceId, Set<Long> prospectiveDependencyIds) {
        // If any of the prospective dependencies transitively depends on targetServiceId, it's circular
        Set<Long> visited = new HashSet<>();
        Queue<Long> queue = new LinkedList<>(prospectiveDependencyIds);

        while (!queue.isEmpty()) {
            Long current = queue.poll();
            if (current.equals(targetServiceId)) {
                throw new IitsmException("Circular dependency detected! Upstream service transitively depends on this service.");
            }
            if (visited.add(current)) {
                serviceCatalogRepository.findById(current).ifPresent(entity -> {
                    if (entity.getDependencies() != null) {
                        for (ServiceEntity dep : entity.getDependencies()) {
                            queue.add(dep.getId());
                        }
                    }
                });
            }
        }
    }

    public ServiceResponseDTO toDTO(ServiceEntity entity) {
        Set<Long> depIds = entity.getDependencies() != null
                ? entity.getDependencies().stream().map(ServiceEntity::getId).collect(Collectors.toSet())
                : Collections.emptySet();
        Set<String> depNames = entity.getDependencies() != null
                ? entity.getDependencies().stream().map(ServiceEntity::getName).collect(Collectors.toSet())
                : Collections.emptySet();

        return ServiceResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .description(entity.getDescription())
                .criticalityFactor(entity.getCriticalityFactor())
                .baseSlaWeight(entity.getBaseSlaWeight())
                .status(entity.getStatus())
                .baselineMttrMinutes(entity.getBaselineMttrMinutes())
                .dependencyIds(depIds)
                .dependencyNames(depNames)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
