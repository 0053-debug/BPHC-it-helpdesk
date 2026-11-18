package com.iitsm.priority;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.enums.Urgency;
import com.iitsm.core.exception.IitsmException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/priority")
public class PriorityController {

    public record PriorityRequest(Impact impact, Urgency urgency, BigDecimal criticalityFactor, int serviceWeight) {}

    public record PriorityResponse(Priority priority, BigDecimal score) {}

    private final PriorityService priorityService;

    public PriorityController(PriorityService priorityService) {
        this.priorityService = priorityService;
    }

    @PostMapping("/calculate")
    public PriorityResponse calculate(@RequestBody PriorityRequest request) {
        try {
            return new PriorityResponse(priorityService.determine(
                    request.impact(), request.urgency(), request.criticalityFactor(), request.serviceWeight()),
                    priorityService.score(request.impact(), request.urgency(), request.criticalityFactor(), request.serviceWeight()));
        } catch (IllegalArgumentException e) {
            // Turn bad input into the team's own exception, which becomes a 400 response
            throw new IitsmException(e.getMessage());
        }
    }
}
