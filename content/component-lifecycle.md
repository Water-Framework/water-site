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
- **Properties Support**: Developers can add properties to the annotation for configuration

### Component Properties

The `@FrameworkComponent` annotation supports properties that can be used for configuration and filtering:

```java
@FrameworkComponent(services = ServiceInterface.class, priority = 3, properties = {
        "filter=value"
})
public class ServiceInterfaceImpl3 implements ServiceInterface {
    @Setter
    @Getter
    private String filter; // Required field for Spring property mapping
    
    @Override
    public String doThing() {
        return "FILTERED BEAN!";
    }
}

@FrameworkComponent(services = ServiceInterface.class, priority = 2)
public class ServiceInterfaceImpl2 implements ServiceInterface {
    // Component with priority only
}

@FrameworkComponent(services = ServiceInterface.class)
public class ServiceInterfaceImpl1 implements ServiceInterface {
    // Component with default priority (1)
}
```

**Properties Usage:**
- **Configuration**: Properties can be used to configure component behavior
- **Filtering**: Properties enable component filtering using ComponentFilter
- **Spring Integration**: Properties work seamlessly with Spring framework
- **Spring Property Mapping**: For Spring support, properties defined in the annotation must have corresponding fields in the component class
- **Framework Context**: Properties are available in the framework context for other components to access

### Component Priority

Components can specify initialization priority using the `priority` attribute. The priority system works as follows:

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

**Priority Model:**
- **Lower Numbers = Higher Priority**: Priority 1 is the highest priority
- **Default Priority**: Framework components have a default priority of 1 (lowest priority)
- **Component Resolution**: When using `findComponent()`, the registry returns the component with the highest priority
- **Multiple Components**: Use `findComponents()` to retrieve all registered components for a given interface

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
    public void onActivateWithComponents(ComponentRegistry componentRegistry, ApplicationProperties appProperties) {
        // Activation with component parameters
        log.info("DocumentService activated with registry and properties");
        // Use componentRegistry and appProperties directly
    }
    
    private void initializeCache() {
        // Cache initialization logic
    }
}
```

**Activation Method Characteristics:**
- **Automatic Execution**: Called automatically when component is activated
- **Component Parameters**: Can receive other components as parameters (not primitive types)
- **Multiple Methods**: Component can have multiple activation methods
- **Exception Handling**: Framework handles activation exceptions gracefully
- **Framework Context Parameters**: Parameters are searched inside the framework context as components
- **Injection Timing**: Note that `@Inject` happens after activation, so injected fields will be null inside activation methods

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
    public void onDeactivateWithComponents(ComponentRegistry componentRegistry) {
        // Deactivation with component parameters
        log.info("DocumentService deactivated with registry");
        performCleanup();
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
- **Component Parameters**: Can receive other components as parameters
- **Cleanup Operations**: Ideal for resource cleanup and shutdown tasks
- **Graceful Shutdown**: Ensures proper resource release

## Parameter Injection

### Framework Context Parameters

Parameters passed to lifecycle methods are searched inside the framework context as components:

```java
@FrameworkComponent
public class ConfigurableService implements ServiceApi {
    
    @OnActivate
    public void onActivate(ComponentRegistry componentRegistry, ApplicationProperties appProperties) {
        // Parameters are searched in framework context as components
        log.info("Service activated with registry and properties");
        
        // Use the components directly
        String configValue = appProperties.getProperty("service.config");
        if (configValue != null) {
            initializeService(configValue);
        }
    }
    
    @OnDeactivate
    public void onDeactivate(ComponentRegistry componentRegistry) {
        // Use component registry for cleanup
        log.info("Service deactivated");
        performCleanup();
    }
}
```

**Parameter Injection Features:**
- **Framework Context**: Parameters come from framework context as components
- **Component Resolution**: Framework resolves parameters as registered components
- **Type Matching**: Parameters must match registered component types
- **Activation Timing**: Parameters are available during activation, unlike `@Inject` fields

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
- **Post-Activation**: Injection happens after activation methods are called

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
        // Returns the highest priority component
        return componentRegistry.findComponent(componentType, null);
    }
    
    public <T> List<T> getAllComponents(Class<T> componentType) {
        // Returns all registered components for the type
        return componentRegistry.findComponents(componentType, null);
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
- **Priority Resolution**: `findComponent()` returns the highest priority component
- **Multiple Components**: `findComponents()` returns all components for a type
- **Lifecycle Control**: Activate/deactivate components programmatically
- **Status Monitoring**: Check component status and health
- **Dependency Analysis**: Analyze component dependencies

## Best Practices

### 1. **Proper Lifecycle Management**
```java
@FrameworkComponent
public class ResourceIntensiveService implements ServiceApi {
    
    private ExecutorService executorService;
    
    @OnActivate
    public void onActivate(ComponentRegistry componentRegistry) {
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
    public void onActivate(ApplicationProperties appProperties, ComponentRegistry componentRegistry) {
        // Parameters are resolved from framework context as components
        boolean enabled = Boolean.parseBoolean(appProperties.getProperty("component.enabled", "false"));
        int maxConnections = Integer.parseInt(appProperties.getProperty("component.max.connections", "10"));
        
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
    public void onActivate(ComponentRegistry componentRegistry) {
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