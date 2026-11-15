package com.iitsm.user.assignment;

public class NoEligibleTechnicianException extends RuntimeException {
    public NoEligibleTechnicianException() {
        super("No available technician has remaining capacity for this assignment");
    }
}
