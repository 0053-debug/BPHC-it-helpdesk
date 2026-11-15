package OOPS_Project;
public class VerifiedState implements IncidentState{
    @Override
    public void close(Incident incident){
         incident.setState(new ClosedState()); 
    }
    @Override
    public String getStateName(){ 
        return "VERIFIED"; 
    }
}