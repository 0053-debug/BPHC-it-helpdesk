package com.iitsm.sla;

import com.iitsm.core.enums.Priority;
import com.iitsm.core.model.SLAPolicy;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SLAPolicyResolverTest {

    private final SLAPolicyRepository repository = mock(SLAPolicyRepository.class);
    private final SLAPolicyResolver resolver = new SLAPolicyResolver(repository);

    @Test
    void returnsPolicyWhenConfigured() {
        SLAPolicy p1 = SLAPolicy.builder()
                .priority(Priority.P1_CRITICAL)
                .responseTargetMinutes(5)
                .resolutionTargetMinutes(30)
                .build();
        when(repository.findByPriority(Priority.P1_CRITICAL)).thenReturn(Optional.of(p1));

        SLAPolicy result = resolver.resolve(Priority.P1_CRITICAL);

        assertEquals(30, result.getResolutionTargetMinutes());
    }

    @Test
    void throwsWhenPolicyMissing() {
        when(repository.findByPriority(Priority.P4_LOW)).thenReturn(Optional.empty());

        assertThrows(SlaNotConfiguredException.class,
                () -> resolver.resolve(Priority.P4_LOW));
    }
}