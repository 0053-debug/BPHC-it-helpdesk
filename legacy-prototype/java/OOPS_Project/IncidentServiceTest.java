package OOPS_Project;

public class IncidentServiceTest {

    public static void main(String[] args) {
        System.out.println("Running Incident Lifecycle Tests...");
        testFullLifecycle();
        testInvalidSkipTransition();
        testResolutionNotesValidation();
        testClosedIncidentCommentRejection();
        System.out.println("All tests passed!");
    }

    private static void testFullLifecycle() {
        IncidentService service = new IncidentService(new InMemoryIncidentRepository());
        Incident incident = service.createIncident(new Incident("Test", "Desc", "NET"));

        service.classifyIncident(incident.getId());
        service.assignIncident(incident.getId());
        service.acknowledgeIncident(incident.getId());
        service.investigateIncident(incident.getId());
        service.resolveIncident(incident.getId(), "Fixed the router.");
        service.verifyIncident(incident.getId());
        Incident closed = service.closeIncident(incident.getId());

        if (!"CLOSED".equals(closed.getStatus())) {
            throw new AssertionError("Lifecycle failed.");
        }
        System.out.println("✓ Full lifecycle passed.");
    }

    private static void testInvalidSkipTransition() {
        IncidentService service = new IncidentService(new InMemoryIncidentRepository());
        Incident incident = service.createIncident(new Incident("Test", "Desc", "NET"));

        try {
            service.closeIncident(incident.getId());
            throw new AssertionError("Failed: Should not allow NEW -> CLOSED skip.");
        } catch (InvalidStateTransitionException e) {
            System.out.println("✓ Invalid skip rejected successfully.");
        }
    }

    private static void testResolutionNotesValidation() {
        IncidentService service = new IncidentService(new InMemoryIncidentRepository());
        Incident incident = service.createIncident(new Incident("Test", "Desc", "NET"));

        service.classifyIncident(incident.getId());
        service.assignIncident(incident.getId());
        service.acknowledgeIncident(incident.getId());
        service.investigateIncident(incident.getId());

        try {
            service.resolveIncident(incident.getId(), "");
            throw new AssertionError("Failed: Should reject empty resolution notes.");
        } catch (IllegalArgumentException e) {
            System.out.println("✓ Empty resolution notes rejected successfully.");
        }
    }

    private static void testClosedIncidentCommentRejection() {
        IncidentService service = new IncidentService(new InMemoryIncidentRepository());
        Incident incident = service.createIncident(new Incident("Test", "Desc", "NET"));

        service.addComment(incident.getId(), "USER-1", "Initial log attached.");
        service.classifyIncident(incident.getId());
        service.assignIncident(incident.getId());
        service.acknowledgeIncident(incident.getId());
        service.investigateIncident(incident.getId());
        service.resolveIncident(incident.getId(), "Patched config.");
        service.verifyIncident(incident.getId());
        service.closeIncident(incident.getId());

        try {
            service.addComment(incident.getId(), "USER-1", "Trying to comment after close.");
            throw new AssertionError("Failed: Should reject comments on CLOSED incidents.");
        } catch (IllegalStateException e) {
            System.out.println("✓ Closed incident comment rejection passed.");
        }
    }
}