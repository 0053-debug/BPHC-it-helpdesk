package com.iitsm.duplicate;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/duplicates")
public class DuplicateController {

    private final DuplicateDetectionService service;

    public DuplicateController(DuplicateDetectionService service) {
        this.service = service;
    }

    @PostMapping("/check")
    public List<DuplicateMatch> check(@RequestBody DuplicateCheckRequest request,
                                      @RequestParam(required = false) Double threshold) {
        if (threshold == null) {
            return service.findDuplicates(request.description(), request.candidates());
        }
        return service.findDuplicates(request.description(), request.candidates(), threshold);
    }
}
