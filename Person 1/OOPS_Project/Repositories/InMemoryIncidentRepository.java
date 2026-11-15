package OOPS_Project;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryIncidentRepository implements IncidentRepository{
    private final Map<String, Incident> database = new ConcurrentHashMap<>();

    @Override
    public Incident save(Incident incident){
        database.put(incident.getId(), incident);
        return incident;
    }

    @Override
    public Optional<Incident> findById(String id){
        return Optional.ofNullable(database.get(id));
    }

    @Override
    public List<Incident> findAll(){
        return new ArrayList<>(database.values());
    }

    @Override
    public void deleteById(String id){
        database.remove(id);
    }
}