package com.iitsm.servicecatalog.dto;

import com.iitsm.servicecatalog.model.ServiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDependencyGraphDTO {

    private List<Node> nodes;
    private List<Edge> edges;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Node {
        private Long id;
        private String name;
        private String code;
        private ServiceStatus status;
        private BigDecimal criticality;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Edge {
        private Long source; // dependent service
        private Long target; // upstream dependency
    }
}
