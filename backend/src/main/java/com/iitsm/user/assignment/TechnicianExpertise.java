package com.iitsm.user.assignment;

public record TechnicianExpertise(long completed, long onTime, double score) {
    public static TechnicianExpertise coldStart() {
        return new TechnicianExpertise(0, 0, 35.0);
    }
}
