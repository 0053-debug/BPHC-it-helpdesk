package com.iitsm.servicecatalog;

import com.iitsm.core.exception.IitsmException;
import com.iitsm.servicecatalog.dto.ServiceCreateRequest;
import com.iitsm.servicecatalog.model.ServiceEntity;
import com.iitsm.servicecatalog.model.ServiceStatus;
import com.iitsm.servicecatalog.repository.ServiceCatalogRepository;
import com.iitsm.servicecatalog.service.ServiceCatalogService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceCatalogServiceTest {

    @Mock
    private ServiceCatalogRepository repository;

    @InjectMocks
    private ServiceCatalogService service;

    @Test
    @DisplayName("Test 5: Throws exception when updating service with self-dependency")
    void shouldThrowExceptionWhenSelfDependencyAttempted() {
        ServiceEntity existing = ServiceEntity.builder()
                .id(1L)
                .name("Database")
                .code("SRV-DB")
                .criticalityFactor(BigDecimal.valueOf(2.0))
                .status(ServiceStatus.OPERATIONAL)
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        ServiceCreateRequest request = ServiceCreateRequest.builder()
                .name("Database")
                .code("SRV-DB")
                .criticalityFactor(BigDecimal.valueOf(2.0))
                .baseSlaWeight(4)
                .status(ServiceStatus.OPERATIONAL)
                .dependencyIds(Set.of(1L)) // Self-dependency!
                .build();

        assertThrows(IitsmException.class, () -> service.updateService(1L, request));
    }
}
