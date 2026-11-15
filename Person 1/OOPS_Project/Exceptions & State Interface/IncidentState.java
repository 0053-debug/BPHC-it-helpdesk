package OOPS_Project;

public interface IncidentState{
    default void classify(Incident incident){
        throw new InvalidStateTransitionException("Cannot classify from current state."); 
    }
    default void assign(Incident incident){ 
        throw new InvalidStateTransitionException("Cannot assign from current state."); 
    }
    default void acknowledge(Incident incident){
        throw new InvalidStateTransitionException("Cannot acknowledge from current state."); 
    }
    default void startInvestigation(Incident incident){
        throw new InvalidStateTransitionException("Cannot start investigation from current state."); 
    }
    default void resolve(Incident incident, String resolutionNotes){
        throw new InvalidStateTransitionException("Cannot resolve from current state."); 
    }
    default void verify(Incident incident){
        throw new InvalidStateTransitionException("Cannot verify from current state."); 
    }
    default void close(Incident incident){
        throw new InvalidStateTransitionException("Cannot close from current state."); 
    }
    String getStateName();
}