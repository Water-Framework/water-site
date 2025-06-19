# Event Management

Water Framework provides a comprehensive event system that enables decoupled communication between components through a publish-subscribe pattern. The event system is built on the Core-api interfaces and supports both general application events and entity-specific CRUD events.

## Event System Architecture

The Water Framework event system is based on several core interfaces from the `it.water.core.api.model.events` package:

### Core Event Interfaces

- **`Event`**: Base interface for all events in the framework
- **`ApplicationEventProducer`**: Interface for components that can produce events
- **`ApplicationEventListener`**: Interface for components that can consume events
- **`PreEvent<T>`** and **`PostEvent<T>`**: Interfaces for events that occur before/after operations
- **`PreDetailedEvent<T>`** and **`PostDetailedEvent<T>`**: Interfaces for events with before/after state

## General Application Events

Water Framework supports general application events that can be used for any type of system-wide communication.

### Event Producer Implementation

```java
@FrameworkComponent
public class DocumentEventProducer implements ApplicationEventProducer {
    
    @Override
    public <T extends Resource, K extends Event> void produceEvent(T resource, Class<K> eventClass) {
        // Produce a simple event
        log.info("Producing event {} for resource {}", eventClass.getSimpleName(), resource);
        // Event distribution logic
    }
    
    @Override
    public <T extends Resource, K extends Event> void produceDetailedEvent(T beforeResource, T afterResource, Class<K> eventClass) {
        // Produce a detailed event with before/after state
        log.info("Producing detailed event {} with before/after state", eventClass.getSimpleName());
        // Detailed event distribution logic
    }
}
```

### Event Listener Implementation

```java
@FrameworkComponent
public class DocumentEventListener implements ApplicationEventListener<Document> {
    
    @Override
    public void consumerEvent(Document resource, Event event) {
        log.info("Received event {} for document: {}", event.getClass().getSimpleName(), resource.getTitle());
        
        // Handle the event based on its type
        if (event instanceof DocumentCreatedEvent) {
            handleDocumentCreated(resource);
        } else if (event instanceof DocumentUpdatedEvent) {
            handleDocumentUpdated(resource);
        }
    }
    
    @Override
    public void consumerDetailedEvent(Document beforeResource, Document afterResource, Event event) {
        log.info("Received detailed event {} for document: {} -> {}", 
                event.getClass().getSimpleName(), beforeResource.getTitle(), afterResource.getTitle());
        
        // Handle detailed event with before/after state
        if (event instanceof DocumentUpdatedEvent) {
            handleDocumentUpdatedDetailed(beforeResource, afterResource);
        }
    }
    
    private void handleDocumentCreated(Document document) {
        // Handle document creation event
        // e.g., send notifications, update indexes, etc.
    }
    
    private void handleDocumentUpdated(Document document) {
        // Handle document update event
    }
    
    private void handleDocumentUpdatedDetailed(Document before, Document after) {
        // Handle detailed update with before/after state
        if (!Objects.equals(before.getTitle(), after.getTitle())) {
            log.info("Document title changed from '{}' to '{}'", before.getTitle(), after.getTitle());
        }
    }
}
```

## Entity CRUD Events

Water Framework automatically generates CRUD events for all entity operations through the `BaseEntitySystemServiceImpl`. These events are fired automatically without any additional configuration.

### Available CRUD Events

The framework provides comprehensive CRUD event interfaces in the `it.water.core.api.entity.events` package:

#### Pre-Operation Events
- **`PreSaveEvent<T>`**: Fired before entity is saved
- **`PreUpdateEvent<T>`**: Fired before entity is updated  
- **`PreRemoveEvent<T>`**: Fired before entity is removed
- **`PreCrudDetailedEvent<T>`**: Base interface for detailed pre-events
- **`PreUpdateDetailedEvent<T>`**: Fired before update with before/after state

#### Post-Operation Events
- **`PostSaveEvent<T>`**: Fired after entity is saved
- **`PostUpdateEvent<T>`**: Fired after entity is updated
- **`PostRemoveEvent<T>`**: Fired after entity is removed
- **`PostCrudDetailedEvent<T>`**: Base interface for detailed post-events
- **`PostUpdateDetailedEvent<T>`**: Fired after update with before/after state

### CRUD Event Implementation

```java
@FrameworkComponent
public class DocumentPreSaveListener implements PreSaveEvent<Document> {
    
    @Override
    public void execute(Document entity) {
        log.info("Document {} is about to be saved", entity.getTitle());
        
        // Pre-save validation or business logic
        if (entity.getFileSize() != null && entity.getFileSize() > 10000000) {
            throw new BusinessException("File size too large for saving");
        }
        
        // Set default values
        if (entity.getCreatedDate() == null) {
            entity.setCreatedDate(new Date());
        }
    }
}

@FrameworkComponent
public class DocumentPostSaveListener implements PostSaveEvent<Document> {
    
    @Override
    public void execute(Document entity) {
        log.info("Document {} has been saved with ID {}", entity.getTitle(), entity.getId());
        
        // Post-save operations
        // e.g., send notifications, update search indexes, etc.
        sendDocumentCreatedNotification(entity);
        updateSearchIndex(entity);
    }
    
    private void sendDocumentCreatedNotification(Document document) {
        // Send notification logic
    }
    
    private void updateSearchIndex(Document document) {
        // Update search index logic
    }
}

@FrameworkComponent
public class DocumentPreUpdateListener implements PreUpdateEvent<Document> {
    
    @Override
    public void execute(Document entity) {
        log.info("Document {} is about to be updated", entity.getTitle());
        
        // Pre-update validation
        validateUpdatePermissions(entity);
    }
    
    private void validateUpdatePermissions(Document document) {
        // Permission validation logic
    }
}

@FrameworkComponent
public class DocumentPostUpdateListener implements PostUpdateEvent<Document> {
    
    @Override
    public void execute(Document entity) {
        log.info("Document {} has been updated", entity.getTitle());
        
        // Post-update operations
        updateSearchIndex(entity);
        sendDocumentUpdatedNotification(entity);
    }
}

@FrameworkComponent
public class DocumentPreRemoveListener implements PreRemoveEvent<Document> {
    
    @Override
    public void execute(Document entity) {
        log.info("Document {} is about to be removed", entity.getTitle());
        
        // Pre-remove validation
        validateRemovalPermissions(entity);
        
        // Cleanup operations
        cleanupRelatedResources(entity);
    }
    
    private void validateRemovalPermissions(Document document) {
        // Permission validation logic
    }
    
    private void cleanupRelatedResources(Document document) {
        // Cleanup logic
    }
}
```

### Detailed Events with Before/After State

For operations that modify entities, Water Framework provides detailed events that include both the before and after state:

```java
@FrameworkComponent
public class DocumentPreUpdateDetailedListener implements PreUpdateDetailedEvent<Document> {
    
    @Override
    public void execute(Document beforeEntity, Document afterEntity) {
        log.info("Document update from '{}' to '{}'", beforeEntity.getTitle(), afterEntity.getTitle());
        
        // Compare before/after state
        if (!Objects.equals(beforeEntity.getTitle(), afterEntity.getTitle())) {
            log.info("Title changed from '{}' to '{}'", beforeEntity.getTitle(), afterEntity.getTitle());
        }
        
        if (!Objects.equals(beforeEntity.getFileSize(), afterEntity.getFileSize())) {
            log.info("File size changed from {} to {}", beforeEntity.getFileSize(), afterEntity.getFileSize());
        }
        
        // Pre-update business logic with before/after context
        validateTitleChange(beforeEntity, afterEntity);
    }
    
    private void validateTitleChange(Document before, Document after) {
        // Business logic for title changes
        if (before.getTitle().contains("confidential") && !after.getTitle().contains("confidential")) {
            throw new BusinessException("Cannot remove 'confidential' from document title");
        }
    }
}

@FrameworkComponent
public class DocumentPostUpdateDetailedListener implements PostUpdateDetailedEvent<Document> {
    
    @Override
    public void execute(Document beforeEntity, Document afterEntity) {
        log.info("Document updated from '{}' to '{}'", beforeEntity.getTitle(), afterEntity.getTitle());
        
        // Post-update operations with before/after context
        if (!Objects.equals(beforeEntity.getTitle(), afterEntity.getTitle())) {
            updateSearchIndex(afterEntity);
            sendTitleChangeNotification(beforeEntity, afterEntity);
        }
        
        if (!Objects.equals(beforeEntity.getFileSize(), afterEntity.getFileSize())) {
            updateStorageQuota(beforeEntity, afterEntity);
        }
    }
    
    private void sendTitleChangeNotification(Document before, Document after) {
        // Notification logic for title changes
    }
    
    private void updateStorageQuota(Document before, Document after) {
        // Storage quota update logic
    }
}
```

## Event System Configuration

Water Framework event system can be configured through properties:

```properties
# Enable/disable event system
water.events.enabled=true

# Event processing timeout (ms)
water.events.timeout=30000

# Enable async event processing
water.events.async=true

# Event queue size
water.events.queue-size=1000

# Enable event logging
water.events.logging=true
```

## Best Practices

### Event Design

1. **Keep events lightweight**: Events should contain only essential information
2. **Use specific event types**: Create specific event classes for different scenarios
3. **Handle exceptions gracefully**: Event listeners should not break the main application flow
4. **Avoid circular dependencies**: Events should not create circular references between components

### Performance Considerations

1. **Use async processing**: For heavy event processing, consider async execution
2. **Batch operations**: Group related events when possible
3. **Monitor event volume**: Track event generation and processing metrics
4. **Cleanup listeners**: Properly unregister listeners when components are destroyed

### Error Handling

```java
@FrameworkComponent
public class RobustDocumentEventListener implements PostSaveEvent<Document> {
    
    @Override
    public void execute(Document entity) {
        try {
            // Event processing logic
            processDocumentSaved(entity);
        } catch (Exception e) {
            // Log error but don't break the main flow
            log.error("Error processing document saved event for {}: {}", entity.getTitle(), e.getMessage(), e);
            
            // Optionally, send error notification
            sendErrorNotification(entity, e);
        }
    }
    
    private void processDocumentSaved(Document document) {
        // Event processing logic
    }
    
    private void sendErrorNotification(Document document, Exception error) {
        // Error notification logic
    }
}
```

This event management system provides Water Framework applications with a powerful, decoupled communication mechanism that supports both general application events and automatic CRUD event generation. 