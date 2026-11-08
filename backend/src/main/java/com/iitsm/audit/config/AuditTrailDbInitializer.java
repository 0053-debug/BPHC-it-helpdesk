package com.iitsm.audit.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditTrailDbInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("Ensuring PostgreSQL audit_logs immutability trigger exists...");
            String sql = """
                CREATE OR REPLACE FUNCTION enforce_audit_log_immutability()
                RETURNS TRIGGER AS $$
                BEGIN
                    RAISE EXCEPTION 'Audit records are strictly immutable. UPDATE and DELETE operations are forbidden.';
                END;
                $$ LANGUAGE plpgsql;

                DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;
                CREATE TRIGGER trg_audit_logs_immutable
                BEFORE UPDATE OR DELETE ON audit_logs
                FOR EACH ROW EXECUTE FUNCTION enforce_audit_log_immutability();
            """;
            jdbcTemplate.execute(sql);
            log.info("PostgreSQL immutability trigger registered successfully on audit_logs.");
        } catch (Exception e) {
            log.warn("Notice: could not register audit immutability trigger (e.g. if running in-memory H2 or limited permissions): {}", e.getMessage());
        }
    }
}
