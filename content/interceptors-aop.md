# Interceptors & AOP

Water Framework provides a comprehensive aspect-oriented programming (AOP) system through interceptors that enable cross-cutting concerns to be handled automatically across all framework components.

## Interceptor System Overview

Water Framework's interceptor system is built on the principle of automatic method interception for all services that implement the `Service` interface. **This is a critical requirement: interceptors only work on classes that implement the Water Framework `Service` interface.** If your class does not implement `Service`, interceptors will not be applied.

### Core Interceptor Types

Water Framework provides **four main types** of interceptors that can be implemented by developers:

#### **1. BeforeMethodInterceptor**
Executes before a method is called, allowing pre-processing logic:

```java
@FrameworkComponent(services = BeforeMethodInterceptor.class)
public class CustomBeforeInterceptor implements BeforeMethodInterceptor<CustomAnnotation> {
    
    @Override
    public <S extends Service> void interceptMethod(S destination, Method m, Object[] args, CustomAnnotation annotation) {
        // Pre-processing logic before method execution
        log.info("Before method execution: {}", m.getName());
    }
    
    @Override
    public Class getAnnotation() {
        return CustomAnnotation.class;
    }
}
```

#### **2. AfterMethodInterceptor**
Executes after a method is called, allowing post-processing logic:

```java
@FrameworkComponent(services = AfterMethodInterceptor.class)
public class CustomAfterInterceptor implements AfterMethodInterceptor<CustomAnnotation> {
    
    @Override
    public <S extends Service> void interceptMethod(S destination, Method m, Object[] args, Object returnResult, CustomAnnotation annotation) {
        // Post-processing logic after method execution
        log.info("After method execution: {} returned: {}", m.getName(), returnResult);
    }
    
    @Override
    public Class getAnnotation() {
        return CustomAnnotation.class;
    }
}
```

#### **3. BeforeMethodFieldInterceptor**
Executes before a method is called and provides access to annotated fields:

```java
@FrameworkComponent(services = BeforeMethodFieldInterceptor.class)
public class CustomFieldInterceptor implements BeforeMethodFieldInterceptor<CustomAnnotation> {
    
    @Override
    public <S extends Service> void interceptMethod(S destination, Method m, List<Field> annotatedFields, Object[] args, CustomAnnotation annotation) {
        // Pre-processing logic with access to annotated fields
        for (Field field : annotatedFields) {
            log.info("Processing field: {} in method: {}", field.getName(), m.getName());
        }
    }
    
    @Override
    public Class getAnnotation() {
        return CustomAnnotation.class;
    }
}
```

#### **4. AfterMethodFieldInterceptor**
Executes after a method is called and provides access to annotated fields:

```java
@FrameworkComponent(services = AfterMethodFieldInterceptor.class)
public class CustomAfterFieldInterceptor implements AfterMethodFieldInterceptor<CustomAnnotation> {
    
    @Override
    public <S extends Service> void interceptMethod(S destination, Method m, List<Field> annotatedFields, Object[] args, CustomAnnotation annotation) {
        // Post-processing logic with access to annotated fields
        for (Field field : annotatedFields) {
            log.info("Post-processing field: {} in method: {}", field.getName(), m.getName());
        }
    }
    
    @Override
    public Class getAnnotation() {
        return CustomAnnotation.class;
    }
}
```

## Current Interceptor Implementations

Water Framework includes several built-in interceptor implementations:

### **1. LogMethodExecutionInterceptor**
Automatically logs method execution for methods annotated with `@LogMethodExecution`:

```java
@FrameworkComponent(services = {BeforeMethodInterceptor.class})
public class LogMethodExecutionInterceptor extends WaterAbstractInterceptor<Service> implements BeforeMethodInterceptor<LogMethodExecution> {
    
    @Inject
    private ComponentRegistry componentsRegistry;
    
    @Override
    public <S extends Service> void interceptMethod(S destination, Method m, Object[] args, LogMethodExecution annotation) {
        Class<?> destinationRealClass = computeServiceClass(destination);
        Logger logger = LoggerFactory.getLogger(destinationRealClass);
        
        StringBuilder sb = new StringBuilder();
        sb.append("Invoking " + m.getName());
        if (args.length > 0) {
            sb.append(", args: ");
            Arrays.stream(args).forEach(arg -> sb.append(arg.toString()));
        }
        
        if (annotation.logDebug() && logger.isDebugEnabled()) {
            logger.debug(sb.toString());
        } else {
            logger.info(sb.toString());
        }
    }
    
    @Override
    public Class getAnnotation() {
        return LogMethodExecution.class;
    }
}
```

**Usage:**
```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @LogMethodExecution
    public Document createDocument(Document document) {
        // This method will be automatically logged
        return documentRepository.persist(document);
    }
}
```

### **2. WaterComponentsInjector**
Handles dependency injection for fields annotated with `@Inject`:

```java
@FrameworkComponent
public class WaterComponentsInjector extends WaterAbstractInterceptor<Service> {
    
    @Inject
    private ComponentRegistry componentRegistry;
    
    // Handles automatic injection of dependencies
    // This is the core injection mechanism for Water Framework
}
```

**Usage:**
```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @Inject
    private DocumentRepository documentRepository;
    
    @Inject
    private UserService userService;
    
    // Fields are automatically injected by the framework
}
```

## Creating Custom Interceptors

### **Step 1: Define Your Annotation**
First, create a custom annotation that will trigger your interceptor:

```java
@Target({ElementType.METHOD})
@Retention(value = RetentionPolicy.RUNTIME)
public @interface AuditMethod {
    String action() default "";
    boolean logParameters() default true;
}
```

### **Step 2: Implement the Interceptor**
Create your interceptor class implementing one of the four interceptor types:

```java
@FrameworkComponent(services = BeforeMethodInterceptor.class)
public class AuditInterceptor implements BeforeMethodInterceptor<AuditMethod> {
    
    private static final Logger log = LoggerFactory.getLogger(AuditInterceptor.class);
    
    @Inject
    private ComponentRegistry componentRegistry;
    
    @Override
    public <S extends Service> void interceptMethod(S destination, Method m, Object[] args, AuditMethod annotation) {
        String methodName = m.getName();
        String className = destination.getClass().getSimpleName();
        String action = annotation.action();
        
        StringBuilder auditMessage = new StringBuilder();
        auditMessage.append("AUDIT: Method ").append(methodName)
                   .append(" in class ").append(className);
        
        if (!action.isEmpty()) {
            auditMessage.append(" for action: ").append(action);
        }
        
        if (annotation.logParameters() && args.length > 0) {
            auditMessage.append(" with parameters: ");
            for (int i = 0; i < args.length; i++) {
                if (i > 0) auditMessage.append(", ");
                auditMessage.append(args[i]);
            }
        }
        
        log.info(auditMessage.toString());
    }
    
    @Override
    public Class getAnnotation() {
        return AuditMethod.class;
    }
}
```

### **Step 3: Use Your Custom Annotation**
Apply your annotation to methods in your service classes:

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @AuditMethod(action = "CREATE_DOCUMENT", logParameters = true)
    public Document createDocument(Document document) {
        // This method will be intercepted by your custom interceptor
        return documentRepository.persist(document);
    }
    
    @AuditMethod(action = "DELETE_DOCUMENT")
    public void deleteDocument(String documentId) {
        // This method will also be intercepted
        documentRepository.remove(documentId);
    }
}
```

## Interceptor Registration and Discovery

### **Automatic Registration**
Interceptors are automatically discovered and registered when:
1. They are annotated with `@FrameworkComponent`
2. They implement one of the four interceptor interfaces
3. They are registered as a service in the component registry

```java
@FrameworkComponent(services = BeforeMethodInterceptor.class, priority = 1)
public class HighPriorityInterceptor implements BeforeMethodInterceptor<CustomAnnotation> {
    // High priority interceptor - executed first
}

@FrameworkComponent(services = AfterMethodInterceptor.class, priority = 2)
public class MediumPriorityInterceptor implements AfterMethodInterceptor<CustomAnnotation> {
    // Medium priority interceptor
}
```

### **Priority System**
Interceptors are executed based on their priority:
- **Lower numbers = Higher priority** (priority 1 is highest)
- **Default priority**: Framework components have priority 1 (lowest)
- **Execution order**: Higher priority interceptors execute first

## Service Requirement

**Critical Requirement**: Interceptors only work on classes that implement the Water Framework `Service` interface.

```java
// ✅ This will work - implements Service
@FrameworkComponent
public class DocumentService implements DocumentApi, Service {
    
    @CustomAnnotation
    public Document createDocument(Document document) {
        // This method will be intercepted
        return documentRepository.persist(document);
    }
}

// ❌ This will NOT work - does not implement Service
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @CustomAnnotation
    public Document createDocument(Document document) {
        // This method will NOT be intercepted
        return documentRepository.persist(document);
    }
}
```

## Interceptor Execution Flow

### **Before Method Execution**
1. Framework scans for `@FrameworkComponent` classes implementing `Service`
2. Identifies methods with annotations that have registered interceptors
3. Executes `BeforeMethodInterceptor` implementations in priority order
4. Executes `BeforeMethodFieldInterceptor` implementations if fields are annotated
5. Proceeds with method execution

### **After Method Execution**
1. Method execution completes (successfully or with exception)
2. Executes `AfterMethodFieldInterceptor` implementations if fields are annotated
3. Executes `AfterMethodInterceptor` implementations in reverse priority order
4. Returns result or throws exception

## Best Practices

### **1. Service Interface Requirement**
Always ensure your classes implement the `Service` interface:

```java
@FrameworkComponent
public class MyService implements MyServiceApi, Service {
    // Your service implementation
}
```

### **2. Efficient Interceptor Design**
```java
@FrameworkComponent(services = BeforeMethodInterceptor.class)
public class EfficientInterceptor implements BeforeMethodInterceptor<CustomAnnotation> {
    
    @Override
    public <S extends Service> void interceptMethod(S destination, Method m, Object[] args, CustomAnnotation annotation) {
        // Avoid expensive operations in interceptors
        if (shouldProcess(m)) {
            processMethod(m, args);
        }
    }
    
    private boolean shouldProcess(Method method) {
        // Add conditions to avoid unnecessary processing
        return method.getName().startsWith("create") || method.getName().startsWith("update");
    }
}
```

### **3. Proper Exception Handling**
```java
@FrameworkComponent(services = AfterMethodInterceptor.class)
public class RobustInterceptor implements AfterMethodInterceptor<CustomAnnotation> {
    
    @Override
    public <S extends Service> void interceptMethod(S destination, Method m, Object[] args, Object returnResult, CustomAnnotation annotation) {
        try {
            // Post-processing logic
            processResult(returnResult);
        } catch (Exception e) {
            // Log but don't throw - don't interfere with method execution
            log.error("Interceptor error", e);
        }
    }
}
```

### **4. Field-Based Interceptors**
Use field interceptors when you need to process annotated fields:

```java
@FrameworkComponent(services = BeforeMethodFieldInterceptor.class)
public class FieldProcessor implements BeforeMethodFieldInterceptor<CustomFieldAnnotation> {
    
    @Override
    public <S extends Service> void interceptMethod(S destination, Method m, List<Field> annotatedFields, Object[] args, CustomFieldAnnotation annotation) {
        for (Field field : annotatedFields) {
            // Process each annotated field
            processField(field, destination);
        }
    }
    
    @Override
    public Class getAnnotation() {
        return CustomFieldAnnotation.class;
    }
}
```

## Monitoring and Debugging

### **Interceptor Logging**
Enable debug logging to see interceptor execution:

```java
@FrameworkComponent(services = BeforeMethodInterceptor.class)
public class DebugInterceptor implements BeforeMethodInterceptor<DebugAnnotation> {
    
    private static final Logger log = LoggerFactory.getLogger(DebugInterceptor.class);
    
    @Override
    public <S extends Service> void interceptMethod(S destination, Method m, Object[] args, DebugAnnotation annotation) {
        log.debug("Interceptor executing for method: {} in class: {}", 
                 m.getName(), destination.getClass().getSimpleName());
    }
    
    @Override
    public Class getAnnotation() {
        return DebugAnnotation.class;
    }
}
```

This comprehensive interceptor system ensures that Water Framework applications have consistent cross-cutting concerns handling, automatic dependency injection, and robust monitoring capabilities while maintaining the critical requirement that all intercepted classes must implement the `Service` interface. 