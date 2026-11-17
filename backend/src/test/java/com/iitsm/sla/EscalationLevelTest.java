package com.iitsm.sla;

import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

class EscalationLevelTest {

    @Test
    void technicianEscalatesToTeamLead() {
        assertEquals(Optional.of(EscalationLevel.TEAM_LEAD), EscalationLevel.TECHNICIAN.next());
    }

    @Test
    void teamLeadEscalatesToSystemAdmin() {
        assertEquals(Optional.of(EscalationLevel.SYSTEM_ADMIN), EscalationLevel.TEAM_LEAD.next());
    }

    @Test
    void systemAdminEscalatesToItManager() {
        assertEquals(Optional.of(EscalationLevel.IT_MANAGER), EscalationLevel.SYSTEM_ADMIN.next());
    }

    @Test
    void itManagerIsTheTopOfTheChain() {
        assertEquals(Optional.empty(), EscalationLevel.IT_MANAGER.next());
    }
}
