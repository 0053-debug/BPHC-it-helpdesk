package OOPS_Project;
public class InProgressState implements IncidentState{
    @Override
    public void resolve(Incident incident,String resolutionNotes){
        if(resolutionNotes == null || resolutionNotes.trim().isEmpty()){
            throw new IllegalArgumentException("Resolution notes are required to resolve an incident.");
        }
        incident.setResolutionNotes(resolutionNotes);
        incident.setState(new ResolvedState());
    }
    @Override
    public String getStateName(){
         return "IN_PROGRESS";
    }
}