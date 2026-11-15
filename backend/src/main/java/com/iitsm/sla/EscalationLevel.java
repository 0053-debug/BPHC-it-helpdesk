package com.iitsm.sla;

import java.util.Optional;

public enum EscalationLevel {
    TECHNICIAN,
    TEAM_LEAD,
    SYSTEM_ADMIN,
    IT_MANAGER;

    public Optional<EscalationLevel> next() {
        EscalationLevel[] all = values();
        int nextIndex = ordinal() + 1;
        return nextIndex < all.length ? Optional.of(all[nextIndex]) : Optional.empty();
    }
}
