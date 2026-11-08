-- =========================================================================
-- Intelligent IT Service Management System (I-ITSM) Database Schema
-- Compatible with PostgreSQL 13+
-- =========================================================================

-- 1. Services & Service Catalog (Person 4)
CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    criticality_factor NUMERIC(3, 2) NOT NULL DEFAULT 1.00, -- 1.00 to 2.00
    base_sla_weight INT NOT NULL DEFAULT 0,                 -- 0 to 4
    status VARCHAR(50) NOT NULL DEFAULT 'OPERATIONAL',      -- OPERATIONAL, DEGRADED, MAINTENANCE, OUTAGE
    baseline_mttr_minutes INT NOT NULL DEFAULT 120,         -- Baseline Expected MTTR in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service Dependencies (Upstream / Downstream Mapping) (Person 4 Innovation Challenge)
CREATE TABLE IF NOT EXISTS service_dependencies (
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    depends_on_service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, depends_on_service_id),
    CONSTRAINT chk_no_self_dependency CHECK (service_id <> depends_on_service_id)
);

-- 2. Audit Trail (Person 4)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT,
    actor_id BIGINT,
    actor_name VARCHAR(150),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    previous_state VARCHAR(50),
    new_state VARCHAR(50),
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PostgreSQL Immutability Trigger for Audit Trail
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

-- 3. Notifications (Person 4)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    recipient_email VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL, -- IN_APP_WS, EMAIL, FCM_PUSH
    reference_id BIGINT,          -- e.g. incidentId
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Shared User Entity Scaffold (Person 2)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,    -- ROLE_EMPLOYEE, ROLE_TECHNICIAN, ROLE_TEAM_LEAD, ROLE_ADMIN
    active BOOLEAN NOT NULL DEFAULT TRUE,
    skills TEXT,                  -- Comma-separated or JSON list of skill tags for technicians
    max_workload INT DEFAULT 5,   -- Max concurrent tickets for technicians
    status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, ON_LEAVE, OFF_DUTY
    department VARCHAR(100),
    fcm_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Shared SLA Policy Entity Scaffold (Person 3)
CREATE TABLE IF NOT EXISTS sla_policies (
    id BIGSERIAL PRIMARY KEY,
    priority VARCHAR(50) NOT NULL UNIQUE, -- P1_CRITICAL, P2_HIGH, P3_MEDIUM, P4_LOW
    response_target_minutes INT NOT NULL,
    resolution_target_minutes INT NOT NULL
);

-- 6. Shared Incident Entity Scaffold (Person 1)
CREATE TABLE IF NOT EXISTS incidents (
    id BIGSERIAL PRIMARY KEY,
    tracking_number VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    service_id BIGINT REFERENCES services(id),
    category VARCHAR(50) NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    impact VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'P4_LOW',
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    reporter_id BIGINT REFERENCES users(id),
    assigned_technician_id BIGINT REFERENCES users(id),
    primary_incident_id BIGINT REFERENCES incidents(id), -- For duplicates
    is_potential_duplicate BOOLEAN DEFAULT FALSE,
    sla_breached BOOLEAN DEFAULT FALSE,
    response_deadline TIMESTAMP WITH TIME ZONE,
    resolution_deadline TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
