package OOPS_Project;
public class NewState implements IncidentState{
    @Override
    public void classify(Incident incident){ 
        incident.setState(new ClassifiedState()); 
    }
    @Override
    public String getStateName(){ 
        return "NEW"; 
    }
}