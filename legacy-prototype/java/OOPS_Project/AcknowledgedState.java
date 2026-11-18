package OOPS_Project;
public class AcknowledgedState implements IncidentState{
    @Override
    public void startInvestigation(Incident incident){ 
        incident.setState(new InProgressState()); 
    }
    @Override
    public String getStateName(){ 
        return "ACKNOWLEDGED"; 
    }
}