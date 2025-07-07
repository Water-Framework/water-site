# REST Service Layer

The Water Framework provides a comprehensive REST service layer that abstracts the underlying technology (Spring, OSGi, Quarkus) and provides a unified approach to exposing REST APIs. This document covers the core concepts, implementation details, and testing strategies.

## Table of Contents

1. [Core REST Concepts](#core-rest-concepts)
2. [REST Service Initialization](#rest-service-initialization)
3. [REST API Interfaces](#rest-api-interfaces)
4. [Security and Authentication](#security-and-authentication)
5. [REST API Managers](#rest-api-managers)
6. [Testing with Karate](#testing-with-karate)

## Core REST Concepts

### Core-api REST Interfaces

The `it.water.service.rest` package in Core-api defines the fundamental REST abstractions:

#### RestApi Interface
```java
public interface RestApi extends Service {
    // Generic interface which identifies a Rest API
    // Used to filter RestApis definition correctly
}
```

**Purpose**: Base interface that all REST APIs must extend. It's used by the framework to identify and manage REST services.

#### RestApiRegistry Interface
```java
public interface RestApiRegistry extends Service {
    void addRestApiService(Class<? extends RestApi> restApiInterface, 
                          Class<? extends RestApi> concreteClass);
    void removeRestApiService(Class<? extends RestApi> restApiInterface);
    Class<?> getRestApiImplementation(Class<? extends RestApi> restApi);
    Map<Class<? extends RestApi>, Class<?>> getRegisteredRestApis();
    void sendRestartApiManagerRestartRequest();
}
```

**Purpose**: Manages the registration and lifecycle of REST API services. It maintains a mapping between REST API interfaces and their concrete implementations.

#### RestApiManager Interface
```java
public interface RestApiManager extends Service {
    void startRestApiServer();
    void stopRestApiServer();
}
```

**Purpose**: Controls the lifecycle of the REST server implementation. Different frameworks (Spring, OSGi, Quarkus) provide their own implementations.

### Default Implementations

The framework provides default implementations for these interfaces:

- **RestApiRegistryDefault**: Manages REST API registration with thread-safe operations
- **RestApiManager**: Framework-specific implementations (CXF, Spring, etc.)

## REST Service Initialization

### Core-bundle Initialization Process

The `AbstractInitializer` class in Core-bundle handles REST service initialization:

#### initializeRestApis() Method
```java
protected void initializeRestApis() {
    try {
        RestApiRegistry restApiRegistry = getComponentRegistry()
            .findComponent(RestApiRegistry.class, null);
        
        // Discover all concrete implementations for every defined rest api
        Iterable<Class<?>> moduleRestApis = getAnnotatedClasses(FrameworkRestController.class);
        this.setupRestApis(moduleRestApis, restApiRegistry);
        
        // Request for server restart if any change is made
        restApiRegistry.sendRestartApiManagerRestartRequest();
    } catch (NoComponentRegistryFoundException e) {
        log.warn("No Rest API Manager or RestApiRegistry found, skipping rest api automatic registration...");
    }
}
```

#### setupRestApis() Method
```java
protected void setupRestApis(Iterable<Class<?>> frameworkRestApis, 
                           RestApiRegistry restApiRegistry) {
    frameworkRestApis.forEach(restApiService -> {
        FrameworkRestController frameworkRestControllerAnnotation = 
            restApiService.getAnnotation(FrameworkRestController.class);
        
        if (restApiRegistry != null) {
            Class<? extends RestApi> genericRestApi = 
                frameworkRestControllerAnnotation.referredRestApi();
            Class<? extends RestApi> concreteRestApi = 
                findConcreteRestApi(getAnnotatedClasses(FrameworkRestApi.class), genericRestApi);
            
            restApiRegistry.addRestApiService(concreteRestApi, 
                (Class<? extends RestApi>) restApiService);
        }
    });
}
```

### When REST Services Are Initialized

REST services are initialized when:

1. **Framework Components Loaded**: All `@FrameworkComponent` classes are discovered and registered
2. **REST API Registry Available**: A `RestApiRegistry` component is found in the component registry
3. **REST Controllers Found**: Classes annotated with `@FrameworkRestController` are discovered
4. **Server Restart Requested**: The registry sends a restart request to the REST API manager

### When REST Services Are Skipped

REST services are skipped when:

1. **No RestApiRegistry**: No `RestApiRegistry` component is found in the component registry
2. **No RestApiManager**: No `RestApiManager` component is available
3. **No REST Controllers**: No classes with `@FrameworkRestController` annotation are found

## REST API Interfaces

### Rest-api Module Interfaces

The Rest-api module provides the core REST infrastructure:

#### RestOptions Interface
```java
public interface RestOptions extends Service {
    String frontendUrl();
    String servicesUrl();
    String restRootContext();
    String uploadFolderPath();
    long uploadMaxFileSize();
    JwtSecurityOptions securityOptions();
}
```

**Purpose**: Configures REST server settings including URLs, context paths, file upload settings, and security options.

#### JwtSecurityOptions Interface
```java
public interface JwtSecurityOptions extends Service {
    boolean validateJwt();
    boolean validateJwtWithJwsUrl();
    String jwtKeyId();
    boolean encryptJWTToken();
    String jwsURL();
    long jwtTokenDurationMillis();
}
```

**Purpose**: Configures JWT security settings including validation, encryption, key management, and token duration.

### JwtTokenService Interface
```java
public interface JwtTokenService extends Service {
    String generateJwtToken(Authenticable authenticable);
    boolean validateToken(List<String> validIssuers, String jwt);
    Set<Principal> getPrincipals(String jwtToken);
    String getJWK();
}
```

**Purpose**: Handles JWT token generation, validation, and principal extraction. Supports both signed and encrypted tokens.

### LoggedIn Annotation
```java
@NameBinding
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(value = RetentionPolicy.RUNTIME)
public @interface LoggedIn {
    String[] issuers() default {"it.water.core.api.model.User"};
}
```

**Purpose**: JAX-RS annotation that marks methods requiring authentication. Can specify multiple issuers for different authentication providers.

### RsSecurityContext Interface
```java
public interface RsSecurityContext extends SecurityContext, 
                                        javax.ws.rs.core.SecurityContext {
    // Extends both Water Framework SecurityContext and JAX-RS SecurityContext
}
```

**Purpose**: Bridges Water Framework security context with JAX-RS security context, providing unified security information.

### WaterJacksonMapper Interface
```java
public interface WaterJacksonMapper extends Service {
    void init(ComponentRegistry componentRegistry);
    ObjectMapper getJacksonMapper();
}
```

**Purpose**: Manages Jackson ObjectMapper configuration for JSON serialization/deserialization with Water Framework extensions.

## Security and Authentication

### JWT Authentication Flow

1. **Token Generation**: `JwtTokenService.generateJwtToken()` creates signed/encrypted tokens
2. **Request Filtering**: JWT authentication filters validate tokens on protected endpoints
3. **Security Context**: Valid tokens create `RsSecurityContext` with user principals
4. **Permission Checking**: Framework uses security context for authorization

### JWT Configuration Properties

```properties
# JWT Security Configuration
water.rest.security.jwt.validate=true
water.rest.security.jwt.validate.by.jws=false
water.rest.security.jwt.key.id=your-key-id
water.rest.security.jwt.encrypt=false
water.rest.security.jwt.jws.url=https://your-jws-url
water.rest.security.jwt.token.duration.millis=3600000
```

### Security Filter Implementation

```java
@Priority(Priorities.AUTHENTICATION)
@LoggedIn
@Provider
public class CxfJwtAuthenticationFilter extends GenericJWTAuthFilter 
    implements ContainerRequestFilter {
    
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        if (!restOptions.securityOptions().validateJwt()) return;
        
        String authorizationHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
        validateToken(jwtTokenService, annotation, authorizationHeader, cookieVal);
        createSecurityContext(authorizationHeader, cookieVal);
    }
}
```

## REST API Managers

### RestApiManager Concept

The `RestApiManager` is responsible for:
- Starting/stopping the REST server
- Registering REST resources
- Configuring security filters
- Setting up JSON providers
- Enabling Swagger documentation

### CXF Implementation (CxfRestApiManager)

```java
@FrameworkComponent
public class CxfRestApiManager extends AbstractRestApiManager implements RestApiManager {
    
    @Override
    public synchronized void startRestApiServer() {
        // Configure CXF Server with interceptors, features, and providers
        JAXRSServerFactoryBean factory = new JAXRSServerFactoryBean();
        factory.setAddress("/");
        factory.setFeatures(features);
        factory.setProviders(providers);
        
        // Register REST APIs as resources
        Map<Class<?>, ResourceProvider> resourceClassesAndProviders = new HashMap<>();
        registeredApis.keySet().forEach(restApi -> {
            Class<?> serviceClass = registeredApis.get(restApi);
            Class<?> concreteRestApiInterface = restApi;
            resourceClassesAndProviders.put(concreteRestApiInterface, 
                new PerRequestProxyProvider(componentRegistry, concreteRestApiInterface, serviceClass));
        });
        
        factory.setResourceClasses(resourceClasses);
        this.server = factory.create();
    }
}
```

**Features**:
- JAX-RS compliant implementation
- Per-request resource providers
- Swagger documentation integration
- JWT authentication filters
- Jackson JSON provider

### Spring Implementation

Spring doesn't use a separate `RestApiManager` because:

1. **Spring MVC Integration**: Spring Boot automatically discovers and registers `@RestController` classes
2. **No JAX-RS Support**: Spring doesn't natively support JAX-RS annotations
3. **Direct Registration**: REST controllers are registered directly as Spring beans

```java
@Service
public class BaseSpringInitializer<T> extends RuntimeInitializer<T, String> {
    
    @EventListener
    public synchronized void applicationStartup(ApplicationReadyEvent event) {
        // Spring automatically handles REST controller registration
        // No need for explicit RestApiManager
        this.initializeRestApis(); // Only for JAX-RS compatibility
    }
}
```

## Testing with Karate

### Karate Test Structure

Water Framework uses Karate for REST API testing, providing:
- BDD-style test scenarios
- JSON response validation
- Authentication testing
- CRUD operation testing

### Test Configuration

#### karate-config.js
```javascript
function fn() {
    let webServerPort = karate.properties['webServerPort'];
    let host = karate.properties['host'];
    let protocol = karate.properties['protocol'];
    let serviceBaseUrl = protocol + "://" + host + ":" + webServerPort;
    let randomSeed = Math.floor(Math.random() * 100);
    
    return {
        "serviceBaseUrl": serviceBaseUrl,
        "randomSeed": randomSeed
    }
}
```

#### Test Class Setup
```java
@ExtendWith(WaterTestExtension.class)
public class UserRestApiTest implements Service {
    
    @Inject
    @Setter
    private ComponentRegistry componentRegistry;
    
    @BeforeEach
    public void beforeEach() {
        TestRuntimeUtils.impersonateAdmin(componentRegistry);
    }
    
    @Karate.Test
    Karate restInterfaceTest() {
        return Karate.run("classpath:karate")
                .systemProperty("webServerPort", 
                    TestRuntimeInitializer.getInstance().getRestServerPort())
                .systemProperty("host", "localhost")
                .systemProperty("protocol", "http");
    }
}
```

### Karate Feature Examples

#### Basic CRUD Test (user-crud.feature)
```gherkin
Feature: Check User Rest Api Response

Scenario: Water User CRUD operations
    Given header Content-Type = 'application/json'
    And header Accept = 'application/json'
    Given url serviceBaseUrl+'/water/users'
    
    # CREATE
    And request
    """
    {
       "username": "username1",
       "name":"name",
       "lastname":"lastName",
       "password":"Password1.",
       "passwordConfirm":"Password1.",
       "email":"user@mail.com"
     }
    """
    When method POST
    Then status 200
    And match response ==
    """
      { "id": #number,
        "entityVersion":1,
        "entityCreateDate":'#number',
        "entityModifyDate":'#number',
        "name":'name',
        "lastname":"lastName",
        "email":"user@mail.com",
        "username": "username1",
        "admin": false,
        "imagePath":null
       }
    """
    * def entityId = response.id
    
    # UPDATE
    Given url serviceBaseUrl+'/water/users'
    And request
    """
    {
       "id": "#(entityId)",
       "username": "usernameUpdated",
       "name":"name",
       "lastname":"lastName",
       "password":"Password1",
       "passwordConfirm":"Password1.",
       "email":"user@mail.com"
     }
    """
    When method PUT
    Then status 200
    
    # FIND
    Given url serviceBaseUrl+'/water/users/'+entityId
    When method GET
    Then status 200
    
    # FIND ALL
    Given url serviceBaseUrl+'/water/users'
    When method GET
    Then status 200
    And match response.results contains
    """
          {
            "id": #number,
            "entityVersion":2,
            "entityCreateDate":'#number',
            "entityModifyDate":'#number',
            "name":'name',
            "lastname":"lastName",
            "email":"user@mail.com",
            "username": "usernameUpdated",
            "admin": false,
            "imagePath":null
          }
    """
    
    # DELETE
    Given url serviceBaseUrl+'/water/users/'+entityId
    When method DELETE
    Then status 204
```

#### Extension Testing (user-crud-with-extension.feature)
```gherkin
Feature: Check User Extension

Scenario: Water User CRUD operations WITH Extension
    Given header Content-Type = 'application/json'
    And header Accept = 'application/json'
    Given url serviceBaseUrl+'/water/users'
    
    And request
    """
    {
       "username": "usernameExtension",
       "name":"name",
       "lastname":"lastName",
       "password":"Password1.",
       "passwordConfirm":"Password1.",
       "email":"user-extension@mail.com",
       "extensionField1":"value1",
       "extensionField2":"value2"
     }
    """
    When method POST
    Then status 200
    And match response ==
    """
      { "id": #number,
        "entityVersion":1,
        "entityCreateDate":'#number',
        "entityModifyDate":'#number',
        "name":'name',
        "lastname":"lastName",
        "email":"user-extension@mail.com",
        "username": "usernameExtension",
        "admin": false,
        "imagePath":null,
        "extensionField1":"value1",
        "extensionField2":"value2"
       }
    """
```

### Test Initialization Process

1. **Test Runtime Setup**: `TestRuntimeInitializer` starts embedded server
2. **Component Registry**: Water Framework components are registered
3. **Admin Impersonation**: Tests run with admin permissions for full access
4. **Karate Execution**: Karate runs feature files against the test server
5. **Response Validation**: JSON responses are validated against expected schemas

### Key Testing Features

- **Random Data**: `randomSeed` generates unique test data
- **JSON Validation**: Exact matching of response structures
- **Status Codes**: HTTP status code validation
- **Authentication**: JWT token testing
- **Extensions**: Entity extension field testing
- **CRUD Operations**: Complete lifecycle testing

## Best Practices

### REST API Design

1. **Use @FrameworkRestApi**: Mark interfaces with `@FrameworkRestApi` for automatic discovery
2. **Implement @FrameworkRestController**: Create concrete implementations with `@FrameworkRestController`
3. **Use @LoggedIn**: Protect endpoints requiring authentication
4. **Leverage @JsonView**: Control JSON serialization with view annotations

### Security Configuration

1. **JWT Validation**: Enable JWT validation for production environments
2. **Token Encryption**: Use encrypted tokens for sensitive applications
3. **Issuer Configuration**: Configure multiple issuers for different authentication providers
4. **Token Duration**: Set appropriate token expiration times

### Testing Strategy

1. **Karate Features**: Use Karate for API contract testing
2. **Response Validation**: Validate exact JSON response structures
3. **Authentication Testing**: Test both authenticated and anonymous endpoints
4. **Extension Testing**: Include entity extension field testing
5. **CRUD Coverage**: Test complete entity lifecycle operations

## Conclusion

The Water Framework REST service layer provides a powerful, flexible, and secure foundation for building REST APIs. By abstracting the underlying technology stack, it enables developers to write cross-framework REST services while maintaining full control over security, serialization, and testing.

The combination of JAX-RS compliance, JWT security, comprehensive testing with Karate, and framework-agnostic design makes it an excellent choice for enterprise applications requiring robust REST API capabilities. 