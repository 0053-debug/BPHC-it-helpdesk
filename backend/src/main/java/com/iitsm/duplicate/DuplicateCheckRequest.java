package com.iitsm.duplicate;

import java.util.List;

public record DuplicateCheckRequest(String description, List<DuplicateCandidate> candidates) {}
