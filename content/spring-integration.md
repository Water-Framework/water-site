# Spring Integration

This section provides comprehensive documentation for integrating the Water Framework with Spring Boot applications, covering configuration, component registration, dependency injection, and testing strategies.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Component Registration](#component-registration)
- [Dependency Injection](#dependency-injection)
- [Security Integration](#security-integration)
- [Testing](#testing)
- [Advanced Features](#advanced-features)

## Overview

The Water Framework Spring integration provides seamless integration with Spring Boot applications, leveraging Spring's dependency injection, component scanning, and lifecycle management while maintaining the Water Framework's component registry and security features.

### Key Features

- **Automatic Component Registration**: `@FrameworkComponent` annotated classes are automatically registered
- **Spring Bean Integration**: Water components can be injected with `@Autowired`
- **Aspect-Oriented Programming**: Method interception for security and cross-cutting concerns
- **Configuration Properties**: Spring Boot configuration properties integration
- **Testing Support**: Comprehensive testing utilities for Spring applications

## Quick Start

### 1. Add Dependencies

Add the Water Framework Spring dependency to your `build.gradle`:

```gradle
dependencies {
    implementation 'it.water:Implementation-spring:1.0.0'
    implementation 'it.water:Core:1.0.0'
}
```

### 2. Enable Water Framework

Add `@EnableWaterFramework` to your main Spring Boot application class:

```java
@SpringBootApplication
@EnableWaterFramework
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
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

## Configuration

### Application Properties

Configure Water Framework properties in `application.properties`:

```properties
# Water Framework Configuration
water.testMode=true
water.cluster.enabled=false
water.rest.enabled=true

# Security Configuration
rs.security.keystore.type=jks
rs.security.keystore.password=water
rs.security.keystore.alias=server-cert
rs.security.keystore.file=classpath:certs/server.keystore
rs.security.key.password=water
rs.security.signature.algorithm=RS256

# Database Configuration
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=

# Email Configuration
water.email.enabled=true
water.email.template.path=classpath:templates/
```

### Custom Configuration

Create custom configuration classes:

```java
@Configuration
@EnableWaterFramework
public class WaterFrameworkConfig {
    
    @Bean
    public ApplicationProperties applicationProperties() {
        SpringApplicationProperties props = new SpringApplicationProperties();
        props.setup();
        return props;
    }
    
    @Bean
    public ComponentRegistry componentRegistry(ConfigurableListableBeanFactory beanFactory) {
        return new SpringComponentRegistry(beanFactory);
    }
}
```

## Component Registration

### Automatic Registration

Water Framework automatically registers components annotated with `@FrameworkComponent`:

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
@Autowired
private ComponentRegistry componentRegistry;

@PostConstruct
public void registerComponents() {
    UserServiceImpl userService = new UserServiceImpl();
    ComponentConfiguration config = ComponentConfigurationFactory
        .createNewComponentPropertyFactory()
        .withPriority(1)
        .build();
    
    componentRegistry.registerComponent(UserApi.class, userService, config);
}
```

### Priority Management

Components are ordered by priority (higher priority first):

```java
@FrameworkComponent(services = {ServiceInterface.class}, priority = 3)
public class HighPriorityServiceImpl implements ServiceInterface {
    // High priority implementation
}

@FrameworkComponent(services = {ServiceInterface.class}, priority = 1)
public class LowPriorityServiceImpl implements ServiceInterface {
    // Low priority implementation
}
```

## Dependency Injection

### Water Framework Injection

Use `@Inject` for Water Framework dependency injection:

```java
@FrameworkComponent(services = {UserApi.class})
public class UserServiceImpl implements UserApi {
    
    @Inject
    @Setter
    private UserSystemApi systemService;
    
    @Inject
    @Setter
    private ComponentRegistry componentRegistry;
    
    @Inject
    @Setter
    private Runtime waterRuntime;
}
```

### Spring Integration

Water components can be injected with `@Autowired`:

```java
@Service
public class MySpringService {
    
    @Autowired
    private UserApi userApi;
    
    @Autowired
    private ComponentRegistry componentRegistry;
    
    public void doSomething() {
        WaterUser user = userApi.findByUsername("testuser");
        // Use the user
    }
}
```

### Mixed Injection

Combine Water Framework and Spring injection:

```java
@FrameworkComponent(services = {UserApi.class})
public class UserServiceImpl implements UserApi {
    
    @Inject
    @Setter
    private UserSystemApi systemService;
    
    @Autowired
    private SpringRepository springRepository;
    
    @Autowired
    private EmailService emailService;
}
```

## Security Integration

### Spring Security Context

Water Framework integrates with Spring Security:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityContext securityContext(Authentication authentication) {
        Set<Principal> principals = new HashSet<>();
        principals.add(new UserPrincipal(
            authentication.getName(),
            authentication.getAuthorities().contains("ROLE_ADMIN"),
            getUserId(authentication),
            "user"
        ));
        return new SpringSecurityContext(principals);
    }
}
```

### Permission Annotations

Use Water Framework permission annotations with Spring:

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserApi userApi;
    
    @GetMapping("/{id}")
    @AllowPermissions(actions = {CrudActions.FIND}, checkById = true, idParamIndex = 0)
    public ResponseEntity<WaterUser> getUser(@PathVariable Long id) {
        WaterUser user = userApi.find(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    @AllowGenericPermissions(actions = {CrudActions.SAVE})
    public ResponseEntity<WaterUser> createUser(@RequestBody WaterUser user) {
        WaterUser savedUser = userApi.save(user);
        return ResponseEntity.ok(savedUser);
    }
}
```

### Method Interception

Water Framework interceptors work seamlessly with Spring:

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

### Spring Boot Test Configuration

```java
@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
@EnableWaterFramework
class UserServiceTest {
    
    @Autowired
    private ComponentRegistry componentRegistry;
    
    @Autowired
    private UserApi userApi;
    
    @Test
    void testUserCreation() {
        WaterUser user = createTestUser();
        WaterUser savedUser = userApi.save(user);
        
        Assertions.assertNotNull(savedUser.getId());
        Assertions.assertEquals(1, savedUser.getEntityVersion());
    }
    
    @Test
    void testComponentRegistration() {
        UserApi userApi = componentRegistry.findComponent(UserApi.class, null);
        Assertions.assertNotNull(userApi);
    }
}
```

### Test Configuration

Create test-specific configuration:

```java
@TestConfiguration
@EnableWaterFramework
public class TestConfig {
    
    @Bean
    public ApplicationProperties applicationProperties() {
        SpringApplicationProperties props = new SpringApplicationProperties();
        props.setup();
        return props;
    }
    
    @Bean
    public TestPermissionManager testPermissionManager() {
        return new TestPermissionManager();
    }
}
```

### Integration Testing

Test REST endpoints with Spring Boot Test:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnableWaterFramework
class UserControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testCreateUser() {
        WaterUser user = createTestUser();
        
        ResponseEntity<WaterUser> response = restTemplate.postForEntity(
            "/api/users", user, WaterUser.class);
        
        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertNotNull(response.getBody().getId());
    }
}
```

## Advanced Features

### Component Filtering

Use component filters to find specific implementations:

```java
@Autowired
private ComponentRegistry componentRegistry;

public void findSpecificComponent() {
    SpringComponentFilterBuilder filterBuilder = new SpringComponentFilterBuilder();
    ComponentFilter filter = filterBuilder.createFilter("environment", "production");
    
    ServiceInterface service = componentRegistry.findComponent(ServiceInterface.class, filter);
    // Use the filtered service
}
```

### Custom Interceptors

Create custom Spring interceptors:

```java
@Component
public class CustomSpringInterceptor implements MethodInterceptor<CustomAnnotation> {
    
    @Override
    public void interceptMethod(Service service, Method method, Object[] args, CustomAnnotation annotation) {
        // Custom interception logic
        log.info("Intercepting method: {}", method.getName());
    }
    
    @Override
    public Class<CustomAnnotation> getAnnotation() {
        return CustomAnnotation.class;
    }
}
```

### Event Handling

Integrate with Spring events:

```java
@Component
public class WaterFrameworkEventListener {
    
    @EventListener
    public void handleApplicationReady(ApplicationReadyEvent event) {
        // Water Framework is ready
        log.info("Water Framework initialized successfully");
    }
    
    @EventListener
    public void handleComponentRegistered(ComponentRegisteredEvent event) {
        log.info("Component registered: {}", event.getComponentClass());
    }
}
```

### Configuration Properties

Use Spring Boot configuration properties:

```java
@ConfigurationProperties(prefix = "water")
@Data
public class WaterFrameworkProperties {
    
    private boolean testMode = false;
    private boolean clusterEnabled = false;
    private boolean restEnabled = true;
    
    private Security security = new Security();
    private Email email = new Email();
    
    @Data
    public static class Security {
        private String keystoreType = "jks";
        private String keystorePassword = "water";
        private String keystoreAlias = "server-cert";
        private String keystoreFile = "classpath:certs/server.keystore";
        private String keyPassword = "water";
        private String signatureAlgorithm = "RS256";
    }
    
    @Data
    public static class Email {
        private boolean enabled = true;
        private String templatePath = "classpath:templates/";
    }
}
```

## Best Practices

### 1. Component Organization

Organize components by functionality:

```java
// User-related components
@FrameworkComponent(services = {UserApi.class})
public class UserServiceImpl implements UserApi { }

@FrameworkComponent(services = {UserSystemApi.class})
public class UserSystemServiceImpl implements UserSystemApi { }

// Order-related components
@FrameworkComponent(services = {OrderApi.class})
public class OrderServiceImpl implements OrderApi { }
```

### 2. Configuration Management

Use profiles for different environments:

```properties
# application-dev.properties
water.testMode=true
water.cluster.enabled=false

# application-prod.properties
water.testMode=false
water.cluster.enabled=true
```

### 3. Testing Strategy

- Use `@SpringBootTest` for integration tests
- Use `@WebMvcTest` for controller tests
- Use `@DataJpaTest` for repository tests
- Mock Water Framework components when needed

### 4. Security Configuration

- Always use permission annotations
- Configure security context properly
- Test with different user roles
- Validate security constraints

### 5. Performance Considerations

- Use component filtering for large registries
- Implement proper caching strategies
- Monitor component registration performance
- Use appropriate logging levels

## Troubleshooting

### Common Issues

1. **Component Not Found**
   - Ensure `@EnableWaterFramework` is present
   - Check component annotations
   - Verify component scanning

2. **Injection Fails**
   - Check `@Inject` vs `@Autowired` usage
   - Verify component registration
   - Check circular dependencies

3. **Security Context Issues**
   - Configure Spring Security properly
   - Ensure authentication is set up
   - Check permission annotations

4. **Test Failures**
   - Use appropriate test annotations
   - Configure test profiles
   - Mock external dependencies

### Debug Configuration

Enable debug logging:

```properties
logging.level.it.water=DEBUG
logging.level.org.springframework=DEBUG
```

## Summary

The Water Framework Spring integration provides:

- **Seamless Integration**: Works naturally with Spring Boot
- **Automatic Registration**: Components are registered automatically
- **Flexible Injection**: Support for both Water and Spring injection
- **Security Integration**: Full integration with Spring Security
- **Comprehensive Testing**: Complete testing support
- **Advanced Features**: Component filtering, custom interceptors, event handling

This integration allows developers to leverage the best of both worlds: Spring Boot's ecosystem and Water Framework's component management and security features. 