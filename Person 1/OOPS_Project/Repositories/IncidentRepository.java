package OOPS_Project;

import java.util.Optional;
import java.util.List;

public interface IncidentRepository{
    Incident save(Incident incident);
    Optional<Incident> findById(String id);
    List<Incident> findAll();
    void deleteById(String id);
}