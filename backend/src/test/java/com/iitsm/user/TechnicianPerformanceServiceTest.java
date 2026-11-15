package com.iitsm.user;

import com.iitsm.core.enums.IncidentCategory;
import com.iitsm.user.assignment.TechnicianExpertise;
import com.iitsm.user.service.TechnicianPerformanceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TechnicianPerformanceServiceTest {

    @Mock
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Test
    void expertiseFormulaMatchesTheAshaDevAndKaranExamples() {
        assertEquals(90.45, TechnicianPerformanceService.calculateExpertiseScore(20, 18), 0.01);
        assertEquals(75.0, TechnicianPerformanceService.calculateExpertiseScore(5, 5), 0.01);
        assertEquals(41.0, TechnicianPerformanceService.calculateExpertiseScore(2, 1), 0.01);
    }

    @Test
    void expertiseIsFetchedOnlyForTheRequestedCategoryAndIgnoresUnreliableRows() {
        TechnicianPerformanceService service = new TechnicianPerformanceService(jdbcTemplate);
        when(jdbcTemplate.queryForList(anyString(), any(SqlParameterSource.class)))
                .thenReturn(List.of(Map.of(
                        "technician_id", 7L,
                        "completed_count", 20L,
                        "on_time_count", 18L)))
                .thenReturn(List.of(Map.of(
                        "technician_id", 7L,
                        "completed_count", 2L,
                        "on_time_count", 1L)));

        Map<Long, TechnicianExpertise> network = service.getExpertiseScores(
                IncidentCategory.NETWORK, List.of(7L, 8L));
        Map<Long, TechnicianExpertise> hardware = service.getExpertiseScores(
                IncidentCategory.HARDWARE, List.of(7L, 8L));

        assertEquals(20, network.get(7L).completed());
        assertEquals(90.45, network.get(7L).score(), 0.01);
        assertEquals(2, hardware.get(7L).completed());
        assertEquals(41.0, hardware.get(7L).score(), 0.01);
        assertEquals(35.0, network.get(8L).score());

        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<SqlParameterSource> parameters = ArgumentCaptor.forClass(SqlParameterSource.class);
        verify(jdbcTemplate, times(2)).queryForList(sql.capture(), parameters.capture());
        assertEquals("NETWORK", parameters.getAllValues().get(0).getValue("category"));
        assertEquals("HARDWARE", parameters.getAllValues().get(1).getValue("category"));
        assertTrue(sql.getValue().contains("status IN ('RESOLVED', 'VERIFIED', 'CLOSED')"));
        assertTrue(sql.getValue().contains("resolved_at IS NOT NULL"));
        assertTrue(sql.getValue().contains("resolution_deadline IS NOT NULL"));
        assertTrue(sql.getValue().contains("resolved_at <= resolution_deadline"));
    }

    @Test
    void missingHistoryReturnsTheSmoothedColdStartScore() {
        TechnicianPerformanceService service = new TechnicianPerformanceService(jdbcTemplate);
        when(jdbcTemplate.queryForList(anyString(), any(SqlParameterSource.class))).thenReturn(List.of());

        Map<Long, TechnicianExpertise> result = service.getExpertiseScores(
                IncidentCategory.SOFTWARE, List.of(11L));

        assertEquals(new TechnicianExpertise(0, 0, 35.0), result.get(11L));
    }
}
