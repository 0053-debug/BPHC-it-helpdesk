package com.iitsm.sla;

import com.iitsm.core.enums.Priority;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.ZoneOffset;
import java.util.List;

@Repository
public class JdbcSlaIncidentSource implements SlaIncidentSource {
    private final JdbcTemplate jdbc;
    public JdbcSlaIncidentSource(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    public List<SlaTrackedIncident> findOpenIncidents() {
        return jdbc.query("""
                SELECT id, priority, created_at, acknowledged_at, resolved_at, assigned_at
                FROM incidents WHERE status NOT IN ('CLOSED')
                """, (rs, row) -> new SlaTrackedIncident(rs.getLong("id"),
                Priority.valueOf(rs.getString("priority")),
                rs.getTimestamp("created_at").toInstant().atOffset(ZoneOffset.UTC).toLocalDateTime(),
                localDateTime(rs.getTimestamp("acknowledged_at")),
                localDateTime(rs.getTimestamp("resolved_at")),
                localDateTime(rs.getTimestamp("assigned_at"))));
    }

    private java.time.LocalDateTime localDateTime(java.sql.Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant().atOffset(ZoneOffset.UTC).toLocalDateTime();
    }
}
