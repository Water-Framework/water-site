# Event System & Notifications

Water Framework provides a comprehensive event system that enables loose coupling between components through event-driven architecture.

## Automatic Event Generation

Water Framework automatically generates events for all CRUD operations through the `BaseEntitySystemServiceImpl`.

**Available Events:**
- **Pre-Save Events**: `PreSaveEvent<T>` - Fired before entity is saved
- **Post-Save Events**: `PostSaveEvent<T>` - Fired after entity is saved
- **Pre-Update Events**: `PreUpdateEvent<T>` - Fired before entity is updated
- **Post-Update Events**: `PostUpdateEvent<T>` - Fired after entity is updated
- **Pre-Remove Events**: `PreRemoveEvent<T>` - Fired before entity is removed
- **Post-Remove Events**: `PostRemoveEvent<T>` - Fired after entity is removed

## Event Implementation Example

```java
@FrameworkComponent
public class DocumentPreSaveListener implements PreSaveEvent<Document> {
    
    @Override
    public void consumerEvent(Document resource, Event event) {
        log.info("Document {} is about to be saved", resource.getTitle());
        // Pre-save logic
    }
}

@FrameworkComponent
public class DocumentPostSaveListener implements PostSaveEvent<Document> {
    
    @Inject
    private NotificationService notificationService;
    
    @Override
    public void consumerEvent(Document resource, Event event) {
        log.info("Document {} has been saved with ID {}", resource.getTitle(), resource.getId());
        notificationService.notifyDocumentCreated(resource);
    }
}
```

## Notification System

Water Framework provides a built-in notification system for sending notifications to users:

```java
@FrameworkComponent
public class NotificationService {
    
    @Inject
    private EmailService emailService;
    
    public void notifyDocumentCreated(Document document) {
        User owner = userService.findUser(document.getOwnerUserId());
        
        EmailNotification email = EmailNotification.builder()
            .to(owner.getEmail())
            .subject("Document Created: " + document.getTitle())
            .body("Your document has been created successfully.")
            .build();
        
        emailService.sendEmail(email);
    }
}
```

This event system ensures that Water Framework applications can build robust, scalable, and loosely coupled architectures. 