package com.iitsm.incident.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class IncidentSchemaInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(IncidentSchemaInitializer.class);
    private final JdbcTemplate jdbc;

    public IncidentSchemaInitializer(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("Ensuring incident and user extension schema columns and tables exist...");
            jdbc.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS root_cause TEXT");
            jdbc.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ");
            jdbc.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS priority_score NUMERIC(8,2)");
            jdbc.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(31)");
            jdbc.execute("UPDATE users SET user_type=CASE WHEN role='ROLE_EMPLOYEE' THEN 'EMPLOYEE' WHEN role='ROLE_TECHNICIAN' THEN 'TECHNICIAN' ELSE 'User' END WHERE user_type IS NULL");
            jdbc.execute("ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'User'");
            jdbc.execute("CREATE TABLE IF NOT EXISTS incident_comments (id BIGSERIAL PRIMARY KEY, incident_id BIGINT NOT NULL REFERENCES incidents(id), author_id BIGINT NOT NULL REFERENCES users(id), message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)");
            jdbc.execute("CREATE TABLE IF NOT EXISTS sla_warnings (id BIGSERIAL PRIMARY KEY, incident_id BIGINT NOT NULL REFERENCES incidents(id), violation_type VARCHAR(30) NOT NULL, recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT uq_sla_warning UNIQUE (incident_id, violation_type))");
            jdbc.execute("CREATE INDEX IF NOT EXISTS idx_incidents_service_created_status ON incidents(service_id, created_at, status)");
            jdbc.execute("CREATE INDEX IF NOT EXISTS idx_incidents_reporter_created ON incidents(reporter_id, created_at DESC)");
            log.info("Incident schema migration executed successfully.");
        } catch (Exception e) {
            log.warn("Notice: incident schema migration non-fatal exception (e.g. running in H2 or columns already present): {}", e.getMessage());
        }
    }
}
