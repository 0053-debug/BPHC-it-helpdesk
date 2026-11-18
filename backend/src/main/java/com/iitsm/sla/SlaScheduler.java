package com.iitsm.sla;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SlaScheduler {

    private static final Logger log = LoggerFactory.getLogger(SlaScheduler.class);

    private final SlaMonitorService monitor;
    private final EscalationService escalation;

    public SlaScheduler(SlaMonitorService monitor, EscalationService escalation) {
        this.monitor = monitor;
        this.escalation = escalation;
    }

    @Scheduled(fixedDelayString = "${sla.monitor.interval-ms:60000}")
    public void run() {
        LocalDateTime now = LocalDateTime.now(java.time.Clock.systemUTC());
        try {
            monitor.check(now);
            escalation.check(now);
        } catch (RuntimeException e) {
            // A database hiccup must not kill the scheduler
            log.error("SLA monitoring run failed", e);
        }
    }
}
