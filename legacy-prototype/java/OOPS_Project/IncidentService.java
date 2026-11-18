package OOPS_Project;

import java.util.NoSuchElementException;

public class IncidentService {
    private final IncidentRepository repository;

    public IncidentService(IncidentRepository repository) {
        this.repository = repository;
    }

    public Incident createIncident(Incident incident) { 
        return repository.save(incident); 
    }

    public Incident getIncident(String id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Incident not found: " + id));
    }

    public Incident classifyIncident(String id) { 
        Incident i = getIncident(id);
        i.classify(); 
        return repository.save(i);
    }

    public Incident assignIncident(String id) { 
        Incident i = getIncident(id); 
        i.assign();
        return repository.save(i); 
    }

    public Incident acknowledgeIncident(String id) { 
        Incident i = getIncident(id); 
        i.acknowledge(); 
        return repository.save(i); 
    }

    public Incident investigateIncident(String id) { 
        Incident i = getIncident(id); 
        i.startInvestigation(); 
        return repository.save(i); 
    }

    public Incident resolveIncident(String id, String notes) { 
        Incident i = getIncident(id); 
        i.resolve(notes); 
        return repository.save(i); 
    }

    public Incident verifyIncident(String id) { 
        Incident i = getIncident(id); 
        i.verify(); 
        return repository.save(i); 
    }

    public Incident closeIncident(String id) {
        Incident i = getIncident(id); 
        i.close(); 
        return repository.save(i); 
    }

    public IncidentComment addComment(String incidentId, String authorId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty.");
        }
        Incident incident = getIncident(incidentId);
        IncidentComment comment = new IncidentComment(incidentId, authorId, content);
        incident.addComment(comment);
        repository.save(incident);
        return comment;
    }
}