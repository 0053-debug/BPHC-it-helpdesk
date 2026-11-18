package OOPS_Project;
public class AssignedState implements IncidentState{
    @Override
    public void acknowledge(Incident incident){ 
        incident.setState(new AcknowledgedState()); 
    }
    @Override
    public String getStateName(){ 
        return "ASSIGNED"; 
    }
}