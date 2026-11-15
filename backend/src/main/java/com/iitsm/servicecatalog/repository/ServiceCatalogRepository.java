package com.iitsm.servicecatalog.repository;

import com.iitsm.servicecatalog.model.ServiceEntity;
import com.iitsm.servicecatalog.model.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCatalogRepository extends JpaRepository<ServiceEntity, Long> {

    Optional<ServiceEntity> findByCode(String code);

    Optional<ServiceEntity> findByName(String name);

    List<ServiceEntity> findByStatus(ServiceStatus status);

    @Query("SELECT DISTINCT s FROM ServiceEntity s LEFT JOIN FETCH s.dependencies")
    List<ServiceEntity> findAllWithDependencies();
}
