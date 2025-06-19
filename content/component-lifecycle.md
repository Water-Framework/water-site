# Component Lifecycle

Water Framework provides comprehensive component lifecycle management through annotations and automatic dependency injection. Components are automatically discovered, instantiated, and managed by the framework.

## Component Registration and Discovery

### @FrameworkComponent Annotation

All Water Framework components must be annotated with `@FrameworkComponent` to be automatically discovered and managed:

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    // Component implementation
}
```

**Key Features:**
- **Automatic Discovery**: Framework scans for annotated components during startup
- **Dependency Injection**: Automatic injection of required dependencies
- **Lifecycle Management**: Framework manages component lifecycle
- **Priority Control**: Optional priority setting for component initialization order

### Component Priority

Components can specify initialization priority using the `priority` attribute:

```java
@FrameworkComponent(priority = 1)
public class HighPriorityService implements ServiceApi {
    // High priority component - initialized first
}

@FrameworkComponent(priority = 2)
public class MediumPriorityService implements ServiceApi {
    // Medium priority component
}

@FrameworkComponent(priority = 3)
public class LowPriorityService implements ServiceApi {
    // Low priority component - initialized last
}
```

## Lifecycle Methods

### @OnActivate Annotation

The `@OnActivate` annotation marks methods that should be executed when a component is activated:

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @Inject
    private DocumentRepository documentRepository;
    
    @OnActivate
    public void onActivate() {
        // Component activation logic
        log.info("DocumentService activated");
        initializeCache();
    }
    
    @OnActivate
    public void onActivateWithParams(@Param("config") String config) {
        // Activation with parameters
        log.info("DocumentService activated with config: {}", config);
    }
    
    private void initializeCache() {
        // Cache initialization logic
    }
}
```

**Activation Method Characteristics:**
- **Automatic Execution**: Called automatically when component is activated
- **Parameter Injection**: Can receive parameters from configuration
- **Multiple Methods**: Component can have multiple activation methods
- **Exception Handling**: Framework handles activation exceptions gracefully

### @OnDeactivate Annotation

The `@OnDeactivate` annotation marks methods that should be executed when a component is deactivated:

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @OnDeactivate
    public void onDeactivate() {
        // Component deactivation logic
        log.info("DocumentService deactivated");
        cleanup();
    }
    
    @OnDeactivate
    public void onDeactivateWithParams(@Param("cleanup") boolean cleanup) {
        // Deactivation with parameters
        if (cleanup) {
            performCleanup();
        }
    }
    
    private void cleanup() {
        // Cleanup logic
    }
    
    private void performCleanup() {
        // Specific cleanup operations
    }
}
```

**Deactivation Method Characteristics:**
- **Automatic Execution**: Called automatically when component is deactivated
- **Parameter Injection**: Can receive parameters from configuration
- **Cleanup Operations**: Ideal for resource cleanup and shutdown tasks
- **Graceful Shutdown**: Ensures proper resource release

## Parameter Injection

### @Param Annotation

The `@Param` annotation allows injection of configuration parameters into lifecycle methods:

```java
@FrameworkComponent
public class ConfigurableService implements ServiceApi {
    
    @OnActivate
    public void onActivate(@Param("service.name") String serviceName,
                          @Param("service.timeout") int timeout,
                          @Param("service.enabled") boolean enabled) {
        
        log.info("Service {} activated with timeout: {}, enabled: {}", 
                serviceName, timeout, enabled);
        
        if (enabled) {
            initializeService(timeout);
        }
    }
    
    @OnDeactivate
    public void onDeactivate(@Param("cleanup.on.shutdown") boolean cleanup) {
        if (cleanup) {
            performCleanup();
        }
    }
}
```

**Parameter Injection Features:**
- **Configuration Source**: Parameters come from framework configuration
- **Type Conversion**: Automatic conversion to appropriate types
- **Default Values**: Can provide default values for missing parameters
- **Validation**: Framework validates parameter types and values

## Dependency Injection

### @Inject Annotation

Water Framework provides automatic dependency injection using the `@Inject` annotation:

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @Inject
    private DocumentRepository documentRepository;
    
    @Inject
    private UserService userService;
    
    @Inject
    private ComponentRegistry componentRegistry;
    
    @Inject
    @Setter
    private NotificationService notificationService;
    
    // Service implementation using injected dependencies
    public Document createDocument(Document document) {
        // Use injected dependencies
        User currentUser = userService.getCurrentUser();
        document.setOwner(currentUser);
        
        Document saved = documentRepository.persist(document);
        
        // Send notification
        notificationService.notifyDocumentCreated(saved);
        
        return saved;
    }
}
```

**Dependency Injection Features:**
- **Automatic Resolution**: Framework automatically resolves dependencies
- **Circular Dependency Detection**: Built-in detection and prevention
- **Lazy Loading**: Dependencies are injected only when needed
- **Interface Implementation**: Can inject by interface or implementation

## Component Registry

### ComponentRegistry Interface

The `ComponentRegistry` provides programmatic access to registered components:

```java
@FrameworkComponent
public class ComponentManager {
    
    @Inject
    private ComponentRegistry componentRegistry;
    
    public void listAllComponents() {
        Collection<Component> components = componentRegistry.getComponents();
        
        for (Component component : components) {
            log.info("Component: {} - Active: {}", 
                    component.getName(), component.isActive());
        }
    }
    
    public <T> T getComponent(Class<T> componentType) {
        return componentRegistry.findComponent(componentType);
    }
    
    public Component getComponentByName(String name) {
        return componentRegistry.findComponentByName(name);
    }
    
    public void activateComponent(String name) {
        Component component = componentRegistry.findComponentByName(name);
        if (component != null) {
            component.activate();
        }
    }
    
    public void deactivateComponent(String name) {
        Component component = componentRegistry.findComponentByName(name);
        if (component != null) {
            component.deactivate();
        }
    }
}
```

**ComponentRegistry Features:**
- **Component Discovery**: Find components by type or name
- **Lifecycle Control**: Activate/deactivate components programmatically
- **Status Monitoring**: Check component status and health
- **Dependency Analysis**: Analyze component dependencies

## Lifecycle Events

### Component Lifecycle Events

Water Framework generates events for component lifecycle changes:

```java
@FrameworkComponent
public class ComponentLifecycleListener implements ComponentActivatedEvent, ComponentDeactivatedEvent {
    
    @Override
    public void onComponentActivated(Component component) {
        log.info("Component activated: {}", component.getName());
        // Handle component activation
    }
    
    @Override
    public void onComponentDeactivated(Component component) {
        log.info("Component deactivated: {}", component.getName());
        // Handle component deactivation
    }
}
```

**Available Lifecycle Events:**
- **ComponentActivatedEvent**: Fired when component is activated
- **ComponentDeactivatedEvent**: Fired when component is deactivated
- **ComponentInitializedEvent**: Fired when component is initialized
- **ComponentDestroyedEvent**: Fired when component is destroyed

## Best Practices

### 1. **Proper Lifecycle Management**
```java
@FrameworkComponent
public class ResourceIntensiveService implements ServiceApi {
    
    private ExecutorService executorService;
    
    @OnActivate
    public void onActivate() {
        // Initialize resources
        executorService = Executors.newFixedThreadPool(10);
        log.info("ResourceIntensiveService activated with thread pool");
    }
    
    @OnDeactivate
    public void onDeactivate() {
        // Cleanup resources
        if (executorService != null) {
            executorService.shutdown();
            try {
                if (!executorService.awaitTermination(60, TimeUnit.SECONDS)) {
                    executorService.shutdownNow();
                }
            } catch (InterruptedException e) {
                executorService.shutdownNow();
            }
        }
        log.info("ResourceIntensiveService deactivated");
    }
}
```

### 2. **Configuration-Driven Components**
```java
@FrameworkComponent
public class ConfigurableComponent implements ServiceApi {
    
    @OnActivate
    public void onActivate(@Param("component.enabled") boolean enabled,
                          @Param("component.max.connections") int maxConnections) {
        
        if (enabled) {
            initializeWithConfig(maxConnections);
        } else {
            log.info("Component disabled by configuration");
        }
    }
}
```

### 3. **Error Handling**
```java
@FrameworkComponent
public class RobustComponent implements ServiceApi {
    
    @OnActivate
    public void onActivate() {
        try {
            // Activation logic
            initializeComponent();
        } catch (Exception e) {
            log.error("Failed to activate component", e);
            // Handle activation failure gracefully
            throw new ComponentActivationException("Component activation failed", e);
        }
    }
    
    @OnDeactivate
    public void onDeactivate() {
        try {
            // Deactivation logic
            cleanupComponent();
        } catch (Exception e) {
            log.error("Failed to deactivate component", e);
            // Continue with deactivation even if cleanup fails
        }
    }
}
```

This comprehensive component lifecycle management ensures that Water Framework applications have robust, configurable, and well-managed component lifecycles with proper resource management and error handling. 