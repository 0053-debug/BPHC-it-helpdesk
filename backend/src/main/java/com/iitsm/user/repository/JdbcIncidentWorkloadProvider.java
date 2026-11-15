package com.iitsm.user.repository;

import com.iitsm.core.exception.IncidentWorkloadUnavailableException;
import com.iitsm.user.service.IncidentWorkloadProvider;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Repository
public class JdbcIncidentWorkloadProvider implements IncidentWorkloadProvider {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcIncidentWorkloadProvider(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Map<Long, Integer> getActiveWorkloads(Collection<Long> technicianIds) {
        if (technicianIds.isEmpty()) {
            return Map.of();
        }

        String query = """
                SELECT assigned_technician_id, COUNT(*) AS active_count
                FROM incidents
                WHERE assigned_technician_id IN (:technicianIds)
                  AND status IN ('ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS')
                GROUP BY assigned_technician_id
                """;
        try {
            Map<Long, Integer> workloads = new HashMap<>();
            jdbcTemplate.query(query,
                    new MapSqlParameterSource("technicianIds", technicianIds),
                    (RowCallbackHandler) resultSet -> workloads.put(
                            resultSet.getLong("assigned_technician_id"),
                            resultSet.getInt("active_count")));
            return workloads;
        } catch (DataAccessException exception) {
            throw new IncidentWorkloadUnavailableException(
                    "Technician workload requires the shared incidents table; integrate Person 1's Incident persistence first",
                    exception);
        }
    }
}
