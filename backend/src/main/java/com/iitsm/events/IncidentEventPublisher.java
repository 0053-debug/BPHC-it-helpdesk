package com.iitsm.events;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Concrete GoF Subject and Spring Event Bridge.
 * Maintains registered observers and broadcasts IncidentEvent instances.
 */
@Component
@Slf4j
public class IncidentEventPublisher implements IncidentSubject {

    private final List<IncidentObserver> observers = new CopyOnWriteArrayList<>();
    private final ApplicationEventPublisher springPublisher;

    @Autowired
    public IncidentEventPublisher(ApplicationEventPublisher springPublisher, List<IncidentObserver> discoveredObservers) {
        this.springPublisher = springPublisher;
        if (discoveredObservers != null) {
            for (IncidentObserver observer : discoveredObservers) {
                registerObserver(observer);
            }
        }
        log.info("IncidentEventPublisher initialized with {} observers.", observers.size());
    }

    @Override
    public void registerObserver(IncidentObserver observer) {
        if (observer != null && !observers.contains(observer)) {
            observers.add(observer);
            log.debug("Registered observer: {}", observer.getClass().getSimpleName());
        }
    }

    @Override
    public void removeObserver(IncidentObserver observer) {
        observers.remove(observer);
        log.debug("Removed observer: {}", observer.getClass().getSimpleName());
    }

    @Override
    public void notifyObservers(IncidentEvent event) {
        log.info("Notifying observers of incident event: {} for Incident ID: {}", event.getEventType(), event.getIncidentId());
        for (IncidentObserver observer : observers) {
            try {
                observer.onIncidentEvent(event);
            } catch (Exception ex) {
                log.error("Error in observer {}: {}", observer.getClass().getSimpleName(), ex.getMessage(), ex);
            }
        }
    }

    /**
     * Convenience method to publish an event both via GoF pattern and Spring ApplicationEventPublisher
     */
    public void publishEvent(IncidentEvent event) {
        notifyObservers(event);
        if (springPublisher != null) {
            springPublisher.publishEvent(event);
        }
    }
}
