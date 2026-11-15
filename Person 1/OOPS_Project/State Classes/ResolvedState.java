package OOPS_Project;
public class ResolvedState implements IncidentState {
    @Override
    public void verify(Incident incident){
         incident.setState(new VerifiedState()); 
    }
    @Override
    public String getStateName(){ 
        return "RESOLVED"; 
    }
}