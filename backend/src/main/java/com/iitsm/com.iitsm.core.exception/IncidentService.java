package com.iitsm.core.service;

import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentComment;
import com.iitsm.core.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.NoSuchElementException;

@Service
public class IncidentService {

    private final IncidentRepository repository;

    public IncidentService(IncidentRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Incident createIncident(Incident incident) {
        return repository.save(incident);
    }

    public Incident getIncident(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Incident not found with id: " + id));
    }

    @Transactional
    public Incident classifyIncident(Long id) {
        Incident i = getIncident(id);
        i.classify();
        return repository.save(i);
    }

    @Transactional
    public Incident assignIncident(Long id) {
        Incident i = getIncident(id);
        i.assign();
        return repository.save(i);
    }

    @Transactional
    public Incident acknowledgeIncident(Long id) {
        Incident i = getIncident(id);
        i.acknowledge();
        return repository.save(i);
    }

    @Transactional
    public Incident investigateIncident(Long id) {
        Incident i = getIncident(id);
        i.startInvestigation();
        return repository.save(i);
    }

    @Transactional
    public Incident resolveIncident(Long id, String notes) {
        Incident i = getIncident(id);
        i.resolve(notes);
        return repository.save(i);
    }

    @Transactional
    public Incident verifyIncident(Long id) {
        Incident i = getIncident(id);
        i.verify();
        return repository.save(i);
    }

    @Transactional
    public Incident closeIncident(Long id) {
        Incident i = getIncident(id);
        i.close();
        return repository.save(i);
    }

    @Transactional
    public Incident closeIncident(Long id, boolean isAuthorized) {
        if (!isAuthorized) {
            throw new SecurityException("Only the ticket reporter or an Administrator may close an incident.");
        }
        return closeIncident(id);
    }

    @Transactional
    public IncidentComment addComment(Long incidentId, String authorId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty.");
        }
        Incident incident = getIncident(incidentId);
        IncidentComment comment = new IncidentComment(incident, authorId, content);
        incident.addComment(comment);
        repository.save(incident);
        return comment;
    }
}