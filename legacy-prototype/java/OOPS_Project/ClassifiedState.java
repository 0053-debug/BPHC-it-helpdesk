package OOPS_Project;
public class ClassifiedState implements IncidentState{
    @Override
    public void assign(Incident incident){ 
        incident.setState(new AssignedState()); 
    }
    @Override
    public String getStateName(){ 
        return "CLASSIFIED"; 
    }
}