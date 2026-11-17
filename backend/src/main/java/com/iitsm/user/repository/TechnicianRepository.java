package com.iitsm.user.repository;

import com.iitsm.core.model.Technician;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    List<Technician> findAllByActiveTrueOrderByIdAsc();
}
