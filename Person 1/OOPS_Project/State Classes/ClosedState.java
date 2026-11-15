package OOPS_Project;
public class ClosedState implements IncidentState{
    // Terminal state. No transitions allowed.
    @Override
    public String getStateName() { return "CLOSED"; }
}