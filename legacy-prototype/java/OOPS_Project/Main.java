package OOPS_Project;

import java.io.IOException;

public class Main{
    public static void main(String[] args){
        IncidentRepository repository = new InMemoryIncidentRepository();
        IncidentService service = new IncidentService(repository);
        IncidentController controller = new IncidentController(service);
        
        try{
            controller.start(8080);
        } 
        catch(IOException e){
            System.err.println("Failed to start server: " + e.getMessage());
        }
    }
}