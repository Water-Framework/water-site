# Interceptors & AOP

Water Framework provides a comprehensive aspect-oriented programming (AOP) system through interceptors that enable cross-cutting concerns to be handled automatically across all framework components.

## Interceptor System Overview

Water Framework's interceptor system is built on the principle of automatic method interception for all services that implement the `Service` interface. This enables cross-cutting concerns like logging, security, validation, and performance monitoring to be applied consistently across the application.

### Core Interceptor Types

Water Framework provides several built-in interceptors that are automatically applied to all service methods:

#### **1. Logging Interceptor**
Automatically logs method entry, exit, parameters, and execution time:

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    public Document createDocument(Document document) {
        // This method is automatically logged by the framework
        return documentRepository.persist(document);
    }
    
    public List<Document> findDocumentsByUser(String userId) {
        // Method parameters and execution time are automatically logged
        return documentRepository.findByUserId(userId);
    }
}
```

**Logging Features:**
- **Method Entry/Exit**: Automatic logging of method calls
- **Parameter Logging**: Logs method parameters (with sensitive data filtering)
- **Execution Time**: Measures and logs method execution time
- **Exception Logging**: Automatic logging of exceptions and stack traces
- **Performance Monitoring**: Identifies slow-performing methods

#### **2. Security Interceptor**
Automatically enforces permission checking for all public API methods:

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @AllowPermission(action = CrudActions.SAVE)
    public Document createDocument(Document document) {
        // Security interceptor automatically checks permissions before execution
        return documentRepository.persist(document);
    }
    
    @AllowPermission(action = CrudActions.FIND)
    public Document findDocument(String id) {
        // Permission checking is automatic
        return documentRepository.find(id);
    }
}
```

**Security Features:**
- **Automatic Permission Checking**: Validates permissions before method execution
- **Role-Based Access Control**: Enforces role-based permissions
- **Resource-Level Security**: Checks permissions on specific resources
- **Security Context**: Maintains security context throughout method execution

#### **3. Validation Interceptor**
Automatically validates method parameters and return values:

```java
@FrameworkComponent
public class UserService implements UserApi {
    
    public User createUser(@NotNull @Valid User user) {
        // Validation interceptor automatically validates the user object
        return userRepository.persist(user);
    }
    
    public void updateUser(@NotNull @Valid User user) {
        // Bean validation annotations are automatically enforced
        userRepository.update(user);
    }
}
```

**Validation Features:**
- **Bean Validation**: Automatic enforcement of JSR-303 validation annotations
- **Parameter Validation**: Validates method parameters
- **Return Value Validation**: Validates method return values
- **Custom Validators**: Support for custom validation logic

#### **4. Transaction Interceptor**
Manages transaction boundaries automatically:

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    public Document createDocumentWithMetadata(Document document, Metadata metadata) {
        // Transaction interceptor automatically manages transaction boundaries
        Document savedDocument = documentRepository.persist(document);
        metadata.setDocumentId(savedDocument.getId());
        metadataRepository.persist(metadata);
        return savedDocument;
    }
}
```

**Transaction Features:**
- **Automatic Transaction Management**: Manages transaction boundaries
- **Rollback on Exception**: Automatic rollback on exceptions
- **Nested Transactions**: Support for nested transaction scenarios
- **Transaction Propagation**: Configurable transaction propagation behavior

#### **5. Performance Interceptor**
Monitors method performance and provides metrics:

```java
@FrameworkComponent
public class ComplexService implements ServiceApi {
    
    public Result performComplexOperation(Input input) {
        // Performance interceptor automatically measures execution time
        // and provides performance metrics
        return processComplexLogic(input);
    }
}
```

**Performance Features:**
- **Execution Time Monitoring**: Measures method execution time
- **Performance Metrics**: Provides detailed performance statistics
- **Slow Query Detection**: Identifies slow-performing operations
- **Resource Usage Monitoring**: Monitors memory and CPU usage

## Custom Interceptors

### Creating Custom Interceptors

Water Framework allows you to create custom interceptors for specific business needs:

```java
@FrameworkComponent
public class AuditInterceptor implements MethodInterceptor {
    
    @Override
    public Object intercept(MethodInvocation invocation) throws Throwable {
        // Pre-execution logic
        String methodName = invocation.getMethod().getName();
        String className = invocation.getMethod().getDeclaringClass().getSimpleName();
        
        log.info("AUDIT: Method {} in class {} called by user {}", 
                methodName, className, getCurrentUser());
        
        try {
            // Execute the method
            Object result = invocation.proceed();
            
            // Post-execution logic
            log.info("AUDIT: Method {} in class {} completed successfully", 
                    methodName, className);
            
            return result;
        } catch (Exception e) {
            // Exception handling
            log.error("AUDIT: Method {} in class {} failed with exception: {}", 
                    methodName, className, e.getMessage());
            throw e;
        }
    }
    
    private String getCurrentUser() {
        // Get current user from security context
        return SecurityContext.getCurrentUser().getUsername();
    }
}
```

### Interceptor Registration

Custom interceptors are automatically registered when annotated with `@FrameworkComponent`:

```java
@FrameworkComponent(priority = 1)
public class HighPriorityInterceptor implements MethodInterceptor {
    // High priority interceptor - executed first
}

@FrameworkComponent(priority = 2)
public class MediumPriorityInterceptor implements MethodInterceptor {
    // Medium priority interceptor
}

@FrameworkComponent(priority = 3)
public class LowPriorityInterceptor implements MethodInterceptor {
    // Low priority interceptor - executed last
}
```

## Interceptor Chain Execution

### Execution Order

Interceptors are executed in a specific order based on their priority:

1. **High Priority Interceptors** (priority = 1)
2. **Medium Priority Interceptors** (priority = 2)
3. **Low Priority Interceptors** (priority = 3)
4. **Framework Core Interceptors** (built-in)

### Interceptor Chain Example

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @AllowPermission(action = CrudActions.SAVE)
    public Document createDocument(Document document) {
        // Interceptor execution order:
        // 1. High Priority Custom Interceptors
        // 2. Medium Priority Custom Interceptors  
        // 3. Low Priority Custom Interceptors
        // 4. Framework Security Interceptor (checks permissions)
        // 5. Framework Validation Interceptor (validates document)
        // 6. Framework Transaction Interceptor (manages transaction)
        // 7. Framework Logging Interceptor (logs method call)
        // 8. Method execution
        // 9. Framework Performance Interceptor (measures execution time)
        // 10. Framework Logging Interceptor (logs method completion)
        
        return documentRepository.persist(document);
    }
}
```

## Aspect-Oriented Programming Features

### Method Pointcuts

Water Framework supports method pointcuts for selective interceptor application:

```java
@FrameworkComponent
public class SelectiveInterceptor implements MethodInterceptor {
    
    @Override
    public boolean shouldIntercept(Method method) {
        // Only intercept methods that return Document objects
        return method.getReturnType().equals(Document.class);
    }
    
    @Override
    public Object intercept(MethodInvocation invocation) throws Throwable {
        // Interceptor logic for Document-returning methods
        return invocation.proceed();
    }
}
```

### Conditional Interception

Interceptors can be conditionally applied based on various criteria:

```java
@FrameworkComponent
public class ConditionalInterceptor implements MethodInterceptor {
    
    @Override
    public boolean shouldIntercept(Method method) {
        // Only intercept methods in specific packages
        String packageName = method.getDeclaringClass().getPackage().getName();
        return packageName.startsWith("com.example.business");
    }
    
    @Override
    public Object intercept(MethodInvocation invocation) throws Throwable {
        // Conditional interceptor logic
        return invocation.proceed();
    }
}
```

## Best Practices

### 1. **Interceptor Performance**
```java
@FrameworkComponent
public class EfficientInterceptor implements MethodInterceptor {
    
    @Override
    public Object intercept(MethodInvocation invocation) throws Throwable {
        // Avoid expensive operations in interceptors
        if (isExpensiveOperation(invocation.getMethod())) {
            // Use async processing for expensive operations
            processAsync(invocation);
        }
        
        return invocation.proceed();
    }
}
```

### 2. **Exception Handling**
```java
@FrameworkComponent
public class RobustInterceptor implements MethodInterceptor {
    
    @Override
    public Object intercept(MethodInvocation invocation) throws Throwable {
        try {
            return invocation.proceed();
        } catch (Exception e) {
            // Handle exceptions gracefully
            log.error("Interceptor error", e);
            // Don't swallow exceptions - rethrow them
            throw e;
        }
    }
}
```

### 3. **Resource Management**
```java
@FrameworkComponent
public class ResourceAwareInterceptor implements MethodInterceptor {
    
    @Override
    public Object intercept(MethodInvocation invocation) throws Throwable {
        // Acquire resources
        Resource resource = acquireResource();
        
        try {
            return invocation.proceed();
        } finally {
            // Always release resources
            releaseResource(resource);
        }
    }
}
```

## Monitoring and Debugging

### Interceptor Metrics

Water Framework provides built-in metrics for interceptor performance:

```java
@FrameworkComponent
public class MetricsInterceptor implements MethodInterceptor {
    
    @Override
    public Object intercept(MethodInvocation invocation) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        try {
            return invocation.proceed();
        } finally {
            long executionTime = System.currentTimeMillis() - startTime;
            recordMetrics(invocation.getMethod(), executionTime);
        }
    }
    
    private void recordMetrics(Method method, long executionTime) {
        // Record interceptor performance metrics
        String methodName = method.getName();
        String className = method.getDeclaringClass().getSimpleName();
        
        // Update metrics
        updateMethodMetrics(className + "." + methodName, executionTime);
    }
}
```

This comprehensive interceptor and AOP system ensures that Water Framework applications have consistent cross-cutting concerns handling, automatic security enforcement, and robust monitoring capabilities. 