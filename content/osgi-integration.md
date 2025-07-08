# OSGi Integration

This section provides comprehensive documentation for integrating the Water Framework with OSGi containers, covering bundle activation, service registration, component management, and testing strategies.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Bundle Structure](#bundle-structure)
- [Component Registration](#component-registration)
- [Service Management](#service-management)
- [Testing](#testing)
- [Advanced Features](#advanced-features)

## Overview

The Water Framework OSGi integration provides seamless integration with OSGi containers, leveraging OSGi's service registry, bundle lifecycle management, and dynamic service discovery while maintaining the Water Framework's component registry and security features.

### Key Features

- **Bundle Activator**: Automatic framework initialization in OSGi bundles
- **Service Registry Integration**: Leverages OSGi service registry for component management
- **Dynamic Service Discovery**: Automatic discovery and registration of services
- **Bundle Lifecycle Management**: Proper startup and shutdown procedures
- **Testing Support**: Comprehensive testing utilities for OSGi applications

## Quick Start

### 1. Bundle Configuration

Create a bundle with proper OSGi metadata in `bnd.bnd`:

```properties
Bundle-Name: My Water Framework Bundle
Bundle-SymbolicName: com.example.mybundle
Bundle-Version: 1.0.0
Bundle-Activator: com.example.MyBundleActivator
Import-Package: it.water.core.api.*,it.water.implementation.osgi.*
Export-Package: com.example.api.*
```

### 2. Bundle Activator

Create a bundle activator that extends `WaterBundleActivator`:

```java
public class MyBundleActivator extends WaterBundleActivator<Object> {
    
    public MyBundleActivator() {
        super(false); // false for non-core bundles
    }
    
    @Override
    public void start(BundleContext bundleContext) throws Exception {
        super.start(bundleContext);
        // Additional bundle-specific initialization
    }
    
    @Override
    public void stop(BundleContext bundleContext) throws Exception {
        super.stop(bundleContext);
        // Additional bundle-specific cleanup
    }
}
```

### 3. Create Your First Component

```java
@FrameworkComponent(services = {UserApi.class})
public class UserServiceImpl extends BaseEntityServiceImpl<WaterUser> implements UserApi {
    
    @Inject
    @Setter
    private UserSystemApi systemService;
    
    @Override
    @AllowGenericPermissions(actions = {CrudActions.FIND})
    public WaterUser findByUsername(String username) {
        return systemService.findByUsername(username);
    }
}
```

## Bundle Structure

### Core Bundle (Water Framework Core)

The core bundle initializes the Water Framework:

```java
public class CoreBundleActivator extends WaterBundleActivator<Object> {
    
    public CoreBundleActivator() {
        super(true); // true for core bundle
    }
    
    @Override
    public void start(BundleContext bundleContext) throws Exception {
        super.start(bundleContext);
        // Core framework initialization
    }
}
```

### Application Bundles

Application bundles extend the framework:

```java
public class UserBundleActivator extends WaterBundleActivator<Object> {
    
    public UserBundleActivator() {
        super(false); // false for application bundles
    }
    
    @Override
    public void start(BundleContext bundleContext) throws Exception {
        super.start(bundleContext);
        // User module initialization
    }
}
```

### Bundle Dependencies

Manage bundle dependencies properly:

```properties
# Core bundle
Bundle-SymbolicName: it.water.core
Bundle-Version: 1.0.0
Bundle-Activator: it.water.core.CoreBundleActivator
Export-Package: it.water.core.api.*,it.water.core.bundle.*

# Implementation bundle
Bundle-SymbolicName: it.water.implementation.osgi
Bundle-Version: 1.0.0
Import-Package: it.water.core.api.*,it.water.core.bundle.*
Export-Package: it.water.implementation.osgi.*

# User bundle
Bundle-SymbolicName: it.water.user
Bundle-Version: 1.0.0
Bundle-Activator: it.water.user.UserBundleActivator
Import-Package: it.water.core.api.*,it.water.implementation.osgi.*
Export-Package: it.water.user.api.*
```

## Component Registration

### Automatic Registration

Components are automatically registered when bundles start:

```java
@FrameworkComponent(services = {UserApi.class, UserSystemApi.class})
public class UserServiceImpl extends BaseEntityServiceImpl<WaterUser> 
    implements UserApi, UserSystemApi {
    
    // Implementation
}
```

### Manual Registration

Register components manually using the component registry:

```java
public class CustomBundleActivator extends WaterBundleActivator<Object> {
    
    @Override
    public void start(BundleContext bundleContext) throws Exception {
        super.start(bundleContext);
        
        ComponentRegistry registry = getComponentRegistry();
        UserServiceImpl userService = new UserServiceImpl();
        
        ComponentConfiguration config = ComponentConfigurationFactory
            .createNewComponentPropertyFactory()
            .withPriority(1)
            .build();
        
        registry.registerComponent(UserApi.class, userService, config);
    }
}
```

### Service Properties

Add properties to service registrations:

```java
@FrameworkComponent(services = {ServiceInterface.class})
public class ServiceImpl implements ServiceInterface {
    
    @Override
    public String doThing() {
        return "FILTERED BEAN!";
    }
}

// Service will be registered with properties
// filter=value, filter1=value1
```

## Service Management

### Service Discovery

Find services using the component registry:

```java
@Component
public class ServiceConsumer {
    
    @Inject
    @Setter
    private ComponentRegistry componentRegistry;
    
    public void useService() {
        ServiceInterface service = componentRegistry.findComponent(ServiceInterface.class, null);
        String result = service.doThing();
    }
}
```

### Service Filtering

Use filters to find specific service implementations:

```java
public void findFilteredService() {
    OSGiComponentFilterBuilder filterBuilder = new OSGiComponentFilterBuilder();
    ComponentFilter filter = filterBuilder.createFilter("environment", "production");
    
    ServiceInterface service = componentRegistry.findComponent(ServiceInterface.class, filter);
    // Use the filtered service
}
```

### Priority Management

Services are ordered by priority:

```java
@FrameworkComponent(services = {ServiceInterface.class}, priority = 3)
public class HighPriorityServiceImpl implements ServiceInterface {
    @Override
    public String doThing() {
        return "done with priority";
    }
}

@FrameworkComponent(services = {ServiceInterface.class}, priority = 1)
public class LowPriorityServiceImpl implements ServiceInterface {
    @Override
    public String doThing() {
        return "done without priority";
    }
}
```

### Service Unregistration

Services are automatically unregistered when bundles stop:

```java
@Override
public void stop(BundleContext bundleContext) throws Exception {
    super.stop(bundleContext);
    // Additional cleanup if needed
}
```

## Security Integration

### OSGi Security Context

Configure security context for OSGi:

```java
@Component
public class SecurityContextProvider {
    
    public SecurityContext createSecurityContext(Set<Principal> principals) {
        return new OsgiSecurityContext(principals);
    }
    
    public SecurityContext createSecurityContext(Set<Principal> principals, String scheme) {
        return new OsgiSecurityContext(principals, scheme);
    }
}
```

### Permission Enforcement

Use permission annotations in OSGi services:

```java
@FrameworkComponent(services = {UserApi.class})
public class UserServiceImpl implements UserApi {
    
    @AllowLoggedUser
    @Override
    public WaterUser updateAccountInfo(WaterUser user) {
        // Only logged users can update their account
        return systemService.update(user);
    }
    
    @AllowRoles(rolesNames = {"admin", "userManager"})
    @Override
    public void deleteUser(Long userId) {
        systemService.remove(userId);
    }
}
```

## Testing

### OSGi Test Configuration

```java
@RunWith(PaxExam.class)
@ExamReactorStrategy(PerSuite.class)
public class WaterFrameworkOSGiTest extends KarafTestSupport {
    
    @Test
    public void testComponentRegistration() {
        ComponentRegistry registry = getOsgiService(ComponentRegistry.class);
        Assert.assertNotNull(registry);
        
        ServiceInterface service = registry.findComponent(ServiceInterface.class, null);
        Assert.assertNotNull(service);
    }
    
    @Test
    public void testServicePriority() {
        ComponentRegistry registry = getOsgiService(ComponentRegistry.class);
        List<ServiceInterface> services = registry.findComponents(ServiceInterface.class, null);
        
        Assert.assertEquals(4, services.size());
        ServiceInterface highestPriority = registry.findComponent(ServiceInterface.class, null);
        Assert.assertEquals("done with priority", highestPriority.doThing());
    }
}
```

### Test Configuration

Configure OSGi test environment:

```java
@TestConfiguration
public class WaterFrameworkTestConfiguration {
    
    @Bean
    public ApplicationProperties applicationProperties() {
        OsgiApplicationProperties props = new OsgiApplicationProperties();
        props.setup();
        return props;
    }
    
    @Bean
    public ComponentRegistry componentRegistry() {
        return OsgiComponentRegistry.getInstance();
    }
}
```

### Integration Testing

Test with Karaf container:

```java
@RunWith(PaxExam.class)
@ExamReactorStrategy(PerSuite.class)
public class UserServiceIntegrationTest extends KarafTestSupport {
    
    @Test
    public void testUserService() {
        UserApi userApi = getOsgiService(UserApi.class);
        Assert.assertNotNull(userApi);
        
        WaterUser user = createTestUser();
        WaterUser savedUser = userApi.save(user);
        
        Assert.assertNotNull(savedUser.getId());
        Assert.assertEquals(1, savedUser.getEntityVersion());
    }
    
    @Test
    public void testSecurityContext() {
        Set<Principal> principals = new HashSet<>();
        principals.add(new UserPrincipal("user", false, 1, "entity"));
        
        OsgiSecurityContext securityContext = new OsgiSecurityContext(principals);
        Assert.assertFalse(securityContext.isSecure());
        Assert.assertEquals("default", securityContext.getAuthenticationScheme());
    }
}
```

## Advanced Features

### Bundle Properties

Load bundle-specific properties:

```java
public class MyBundleActivator extends WaterBundleActivator<Object> {
    
    @Override
    protected void setupApplicationProperties() {
        super.setupApplicationProperties();
        
        // Load bundle-specific properties
        ApplicationProperties props = getComponentRegistry()
            .findComponent(ApplicationProperties.class, null);
        
        if (props instanceof OsgiApplicationProperties) {
            ((OsgiApplicationProperties) props).loadBundleProperties(bundleContext);
        }
    }
}
```

### Service Interceptors

Create custom OSGi service interceptors:

```java
@Component
public class CustomOsgiInterceptor implements MethodInterceptor<CustomAnnotation> {
    
    @Override
    public void interceptMethod(Service service, Method method, Object[] args, CustomAnnotation annotation) {
        // Custom interception logic
        log.info("Intercepting OSGi service method: {}", method.getName());
    }
    
    @Override
    public Class<CustomAnnotation> getAnnotation() {
        return CustomAnnotation.class;
    }
}
```

### Dynamic Service Management

Handle dynamic service registration and unregistration:

```java
@Component
public class ServiceMonitor {
    
    @Inject
    @Setter
    private ComponentRegistry componentRegistry;
    
    public void monitorServices() {
        // Monitor service registrations
        List<ServiceInterface> services = componentRegistry.findComponents(ServiceInterface.class, null);
        log.info("Found {} ServiceInterface implementations", services.size());
        
        for (ServiceInterface service : services) {
            log.info("Service: {}", service.getClass().getName());
        }
    }
}
```

### Bundle Lifecycle Events

Handle bundle lifecycle events:

```java
@Component
public class BundleLifecycleMonitor {
    
    @EventListener
    public void handleBundleStarted(BundleStartedEvent event) {
        log.info("Bundle started: {}", event.getBundle().getSymbolicName());
    }
    
    @EventListener
    public void handleBundleStopped(BundleStoppedEvent event) {
        log.info("Bundle stopped: {}", event.getBundle().getSymbolicName());
    }
}
```

## Best Practices

### 1. Bundle Organization

Organize bundles by functionality:

```
it.water.core                    # Core framework
it.water.implementation.osgi     # OSGi implementation
it.water.user                    # User module
it.water.order                   # Order module
it.water.payment                 # Payment module
```

### 2. Service Registration

- Use `@FrameworkComponent` for automatic registration
- Set appropriate priorities for services
- Add meaningful service properties
- Handle service lifecycle properly

### 3. Testing Strategy

- Use PaxExam for OSGi testing
- Test with real OSGi container (Karaf)
- Mock external dependencies
- Test service registration and discovery

### 4. Security Configuration

- Configure security context properly
- Use permission annotations consistently
- Test with different user roles
- Validate security constraints

### 5. Performance Considerations

- Minimize bundle dependencies
- Use service filtering for large registries
- Implement proper cleanup in bundle stops
- Monitor service registration performance

## Troubleshooting

### Common Issues

1. **Bundle Not Starting**
   - Check bundle dependencies
   - Verify bundle activator class
   - Check OSGi manifest headers

2. **Service Not Found**
   - Verify service registration
   - Check service interfaces
   - Ensure bundle is active

3. **Class Loading Issues**
   - Check Import-Package declarations
   - Verify Export-Package declarations
   - Check bundle classpath

4. **Security Context Issues**
   - Configure OSGi security properly
   - Ensure authentication is set up
   - Check permission annotations

### Debug Configuration

Enable debug logging:

```properties
# Karaf logging
log:set DEBUG it.water
log:set DEBUG org.osgi
log:set DEBUG org.apache.karaf
```

### Bundle Commands

Use Karaf commands for debugging:

```bash
# List bundles
bundle:list

# Check bundle state
bundle:info <bundle-id>

# Check services
service:list

# Check service details
service:list <service-interface>
```

## Summary

The Water Framework OSGi integration provides:

- **Bundle Lifecycle Management**: Proper startup and shutdown procedures
- **Service Registry Integration**: Leverages OSGi service registry
- **Dynamic Service Discovery**: Automatic service registration and discovery
- **Security Integration**: Full integration with OSGi security
- **Comprehensive Testing**: Complete testing support with PaxExam
- **Advanced Features**: Bundle properties, service interceptors, lifecycle events

This integration allows developers to build modular, dynamic applications that can be deployed, updated, and managed independently in an OSGi container while maintaining the Water Framework's component management and security features. 