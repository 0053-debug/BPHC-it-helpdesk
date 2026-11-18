-- Seed Data for Demonstration & Development

-- 1. Seed Services
INSERT INTO services (id, name, code, description, criticality_factor, base_sla_weight, status, baseline_mttr_minutes)
VALUES
    (1, 'Central Authentication (SSO / LDAP)', 'SRV-AUTH', 'Single Sign-On and Directory Services', 2.00, 4, 'OPERATIONAL', 30),
    (2, 'Corporate Network & VPN', 'SRV-NET', 'Campus Wi-Fi, Ethernet, and Remote Access VPN', 2.00, 3, 'OPERATIONAL', 45),
    (3, 'Database Cluster (PostgreSQL)', 'SRV-DB', 'Enterprise relational persistence cluster', 2.00, 4, 'OPERATIONAL', 30),
    (4, 'Enterprise ERP & Student Portal', 'SRV-ERP', 'Academic and administrative ERP platform', 1.50, 2, 'OPERATIONAL', 60),
    (5, 'Cloud Storage & File Share', 'SRV-STORE', 'Enterprise file storage and cloud backup', 1.25, 1, 'OPERATIONAL', 120),
    (6, 'Developer & CI/CD Platform', 'SRV-DEV', 'Git repository and automated deployment pipelines', 1.00, 0, 'OPERATIONAL', 180)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence if needed
SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));

-- 2. Seed Service Dependencies (Innovation Challenge)
-- ERP depends on Database Cluster and Central Authentication
INSERT INTO service_dependencies (service_id, depends_on_service_id)
VALUES
    (4, 3), -- ERP depends on DB
    (4, 1), -- ERP depends on Auth
    (1, 2)  -- Auth depends on Network
ON CONFLICT DO NOTHING;

-- 3. Seed SLA Policies
INSERT INTO sla_policies (id, priority, response_target_minutes, resolution_target_minutes)
VALUES
    (1, 'P1_CRITICAL', 5, 30),
    (2, 'P2_HIGH', 15, 120),
    (3, 'P3_MEDIUM', 60, 480),
    (4, 'P4_LOW', 240, 1440)
ON CONFLICT (id) DO NOTHING;

-- Demo users are intentionally not seeded with fixed credentials. Enable the
-- environment-configured DemoAccountConfig only for a local presentation.
