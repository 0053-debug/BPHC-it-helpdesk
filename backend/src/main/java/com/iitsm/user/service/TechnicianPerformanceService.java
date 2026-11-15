package com.iitsm.user.service;

import com.iitsm.core.enums.IncidentCategory;
import com.iitsm.user.assignment.TechnicianExpertise;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TechnicianPerformanceService {

    private static final String EXPERTISE_QUERY = """
            SELECT assigned_technician_id AS technician_id,
                   COUNT(*) AS completed_count,
                   COUNT(*) FILTER (WHERE resolved_at <= resolution_deadline) AS on_time_count
            FROM incidents
            WHERE assigned_technician_id IN (:technicianIds)
              AND category = :category
              AND status IN ('RESOLVED', 'VERIFIED', 'CLOSED')
              AND resolved_at IS NOT NULL
              AND resolution_deadline IS NOT NULL
            GROUP BY assigned_technician_id
            """;

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public TechnicianPerformanceService(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public Map<Long, TechnicianExpertise> getExpertiseScores(
            IncidentCategory category, Collection<Long> technicianIds) {
        if (technicianIds.isEmpty()) {
            return Map.of();
        }

        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("technicianIds", technicianIds)
                .addValue("category", category.name());
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(EXPERTISE_QUERY, parameters);
        Map<Long, TechnicianExpertise> expertise = new HashMap<>();
        for (Map<String, Object> row : rows) {
            long technicianId = ((Number) row.get("technician_id")).longValue();
            long completed = ((Number) row.get("completed_count")).longValue();
            long onTime = ((Number) row.get("on_time_count")).longValue();
            expertise.put(technicianId, new TechnicianExpertise(
                    completed, onTime, calculateExpertiseScore(completed, onTime)));
        }

        TechnicianExpertise coldStart = TechnicianExpertise.coldStart();
        technicianIds.forEach(id -> expertise.putIfAbsent(id, coldStart));
        return Map.copyOf(expertise);
    }

    public static double calculateExpertiseScore(long completed, long onTime) {
        if (completed < 0 || onTime < 0 || onTime > completed) {
            throw new IllegalArgumentException("Incident performance counts must be non-negative and on-time cannot exceed completed");
        }
        return 70.0 * ((onTime + 1.0) / (completed + 2.0))
                + 30.0 * Math.min(completed / 10.0, 1.0);
    }
}
